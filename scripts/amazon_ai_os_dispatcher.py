from __future__ import annotations

import argparse
import json
import os
import shutil
import sys
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / ".codex/amazon-ai-os.config.json"
QUEUE_NAMES = ("inbox", "running", "approval", "completed", "failed", "blocked")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def queue_root(config: dict[str, Any]) -> Path:
    override = os.environ.get("AMAZON_AI_OS_QUEUE_ROOT")
    if override:
        return Path(override)
    return ROOT / config["queue_root"]


def ensure_queues(config: dict[str, Any]) -> None:
    for name in QUEUE_NAMES:
        (queue_root(config) / name).mkdir(parents=True, exist_ok=True)


def validate_required(data: dict[str, Any], required: list[str], label: str) -> None:
    missing = [field for field in required if field not in data]
    if missing:
        raise ValueError(f"{label} missing required fields: {', '.join(missing)}")


def route_task(task: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    scenario = task["scenario"]
    for rule in config["routing_rules"]:
        if rule["scenario"] == scenario:
            return rule
    raise ValueError(f"No routing rule for scenario: {scenario}")


def build_dispatches(task: dict[str, Any], route: dict[str, Any], config: dict[str, Any]) -> list[dict[str, Any]]:
    agent_ids = [route["primary"], *route["collaborators"]]
    if len(agent_ids) > config["dispatch_policy"]["max_calls_per_task"]:
        raise ValueError("Dispatch count exceeds max_calls_per_task")
    seen: set[tuple[str, str, str]] = set()
    records = []
    for index, agent_id in enumerate(agent_ids):
        responsibility = "综合裁决" if agent_id == route["primary"] else f"{agent_id}专项分析"
        key = (task["task_id"], agent_id, responsibility)
        if key in seen:
            raise ValueError(f"Duplicate dispatch: {key}")
        seen.add(key)
        records.append(
            {
                "task_id": task["task_id"],
                "agent_id": agent_id,
                "responsibility": responsibility,
                "call_id": f"standalone-{uuid.uuid4()}",
                "status": "queued",
                "started_at": "",
                "finished_at": "",
                "input_summary": task["objective"],
                "failure_reason": "",
            }
        )
    return records


def mock_result(agent_id: str, behavior: str) -> dict[str, Any]:
    if behavior == "missing_contract":
        return {"结论": f"{agent_id} 输出不完整"}
    return {
        "结论": f"{agent_id} 已完成确定性测试分析",
        "依据": ["测试证据包"],
        "数据来源": ["local_test_fixture"],
        "置信度": "中",
        "缺失字段": [],
        "风险等级": "中",
        "建议动作": ["保持人工审批门"],
        "验收指标": ["调度结果可回收"],
        "人工复核": "用户",
    }


def real_result(agent_id: str, task: dict[str, Any]) -> dict[str, Any]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    prompt = (
        "你是 Amazon-AI-OS 中已注册的专项智能体。"
        "请仅基于给定任务输出 JSON，字段必须为：结论、依据、数据来源、置信度、缺失字段、风险等级、建议动作、验收指标、人工复核。"
        f"\n智能体ID：{agent_id}\n任务：{json.dumps(task, ensure_ascii=False)}"
    )
    body = json.dumps({"model": os.environ.get("AMAZON_AI_OS_MODEL", "gpt-5.5"), "input": prompt}).encode("utf-8")
    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=body,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Real adapter request failed: {exc}") from exc
    text = payload.get("output_text")
    if not text:
        for item in payload.get("output", []):
            for content in item.get("content", []):
                if content.get("type") == "output_text":
                    text = content.get("text")
                    break
    if not text:
        raise RuntimeError("Real adapter returned no output text")
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise RuntimeError("Real adapter output is not valid JSON") from exc


def contract_missing(result: dict[str, Any], config: dict[str, Any]) -> list[str]:
    return [field for field in config["result_contract"] if field not in result]


def approval_valid(task: dict[str, Any]) -> bool:
    approval = task.get("approval", {})
    return approval.get("status") == "approved" and bool(approval.get("approver"))


def closure_complete(task: dict[str, Any]) -> bool:
    closure = task.get("closure", {})
    return all(
        closure.get(field) is True
        for field in ["second_verification", "test_result", "monitoring_plan", "knowledge_writeback"]
    )


def process(path: Path, adapter: str, behavior: str = "success") -> tuple[dict[str, Any], Path]:
    config = load_json(CONFIG)
    ensure_queues(config)
    task = load_json(path)
    validate_required(task, config["task_schema"]["required"], "task")
    route = route_task(task, config)
    task["route"] = route
    task["state"] = "分析中"
    task["dispatches"] = build_dispatches(task, route, config)
    running_path = queue_root(config) / "running" / path.name
    write_json(running_path, task)
    if path.resolve() != running_path.resolve() and path.exists():
        path.unlink()

    all_complete = True
    for record in task["dispatches"]:
        record["status"] = "running"
        record["started_at"] = now()
        try:
            if behavior == "timeout":
                raise TimeoutError("deterministic timeout")
            if behavior == "failed":
                raise RuntimeError("deterministic failure")
            result = real_result(record["agent_id"], task) if adapter == "real" else mock_result(record["agent_id"], behavior)
            missing = contract_missing(result, config)
            if missing:
                record["status"] = "needs_supplement"
                record["failure_reason"] = "missing contract fields: " + ", ".join(missing)
                all_complete = False
            else:
                record["status"] = "completed"
            record["result"] = result
        except Exception as exc:
            record["status"] = "blocked" if adapter == "real" and "OPENAI_API_KEY" in str(exc) else "failed"
            record["failure_reason"] = str(exc)
            all_complete = False
        record["finished_at"] = now()

    risk = task["risk_level"]
    if any(record["status"] == "blocked" for record in task["dispatches"]):
        destination, task["state"] = "blocked", "受阻"
    elif not all_complete:
        destination, task["state"] = "failed", "失败待处理"
    elif risk in config["closure_gates"]["approval_required_for"] and not approval_valid(task):
        destination, task["state"] = "approval", "待审批"
    elif not closure_complete(task):
        destination, task["state"] = "running", "执行准备"
    else:
        destination, task["state"] = "completed", "已验证"
    task["updated_at"] = now()
    target = queue_root(config) / destination / path.name
    write_json(target, task)
    if running_path.exists() and running_path.resolve() != target.resolve():
        running_path.unlink()
    return task, target


def init_task(path: Path, task_id: str, scenario: str, risk: str) -> None:
    config = load_json(CONFIG)
    ensure_queues(config)
    task = {
        "task_id": task_id,
        "title": f"{task_id} Amazon-AI-OS task",
        "objective": "验证真实路由、专项智能体分派、审批门和闭环门禁",
        "scenario": scenario,
        "risk_level": risk,
        "evidence": ["local_test_fixture"],
        "acceptance_metrics": ["结果可回收", "审批门生效"],
        "approval": {"status": "pending", "approver": ""},
        "closure": {
            "second_verification": False,
            "test_result": False,
            "monitoring_plan": False,
            "knowledge_writeback": False
        },
        "state": "待分析",
        "created_at": now(),
    }
    write_json(path, task)


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    init_parser = sub.add_parser("init")
    init_parser.add_argument("--path", required=True)
    init_parser.add_argument("--task-id", required=True)
    init_parser.add_argument("--scenario", default="asin_full_diagnosis")
    init_parser.add_argument("--risk", default="medium")
    run_parser = sub.add_parser("run")
    run_parser.add_argument("--path", required=True)
    run_parser.add_argument("--adapter", choices=["mock", "real"], default="mock")
    run_parser.add_argument("--behavior", choices=["success", "timeout", "failed", "missing_contract"], default="success")
    args = parser.parse_args()
    if args.command == "init":
        init_task(Path(args.path), args.task_id, args.scenario, args.risk)
        print(f"Amazon-AI-OS task initialized: {args.path}")
        return 0
    task, target = process(Path(args.path), args.adapter, args.behavior)
    print(f"Amazon-AI-OS dispatch: {task['state']} -> {target}")
    return 0 if task["state"] in {"待审批", "已验证"} else 2


if __name__ == "__main__":
    sys.exit(main())
