from __future__ import annotations

import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

import amazon_ai_os_dispatcher as dispatcher


ROOT = Path(__file__).resolve().parent.parent
CONFIG_PATH = ROOT / ".codex/amazon-ai-os.config.json"


def write(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def base_task(task_id: str, scenario: str = "asin_full_diagnosis", risk: str = "medium") -> dict:
    return {
        "task_id": task_id,
        "title": "dispatcher test",
        "objective": "验证调度闭环",
        "scenario": scenario,
        "risk_level": risk,
        "evidence": ["fixture"],
        "acceptance_metrics": ["pass"],
        "approval": {"status": "pending", "approver": ""},
    }


def main() -> int:
    work_root = ROOT / "work"
    work_root.mkdir(parents=True, exist_ok=True)
    temp = Path(tempfile.mkdtemp(prefix="amazon-ai-os-test-", dir=work_root))
    os.environ["AMAZON_AI_OS_QUEUE_ROOT"] = str(temp)
    checks: list[tuple[str, bool]] = []
    try:
        inbox = temp / "inbox"
        success = inbox / "success.json"
        write(success, base_task("T-SUCCESS"))
        result, _ = dispatcher.process(success, "mock", "success")
        checks.append(("真实路由与审批门", result["state"] == "待审批" and len(result["dispatches"]) >= 4))
        checks.append(("幂等分派键唯一", len({(x["task_id"], x["agent_id"], x["responsibility"]) for x in result["dispatches"]}) == len(result["dispatches"])))

        approved = inbox / "approved.json"
        approved_task = base_task("T-APPROVED")
        approved_task["approval"] = {"status": "approved", "approver": "test-owner"}
        write(approved, approved_task)
        result, _ = dispatcher.process(approved, "mock", "success")
        checks.append(("审批后闭环门禁仍生效", result["state"] == "执行准备"))

        closed = inbox / "closed.json"
        closed_task = base_task("T-CLOSED")
        closed_task["approval"] = {"status": "approved", "approver": "test-owner"}
        closed_task["closure"] = {
            "second_verification": True,
            "test_result": True,
            "monitoring_plan": True,
            "knowledge_writeback": True,
        }
        write(closed, closed_task)
        result, _ = dispatcher.process(closed, "mock", "success")
        checks.append(("全部门禁完成可进入验证", result["state"] == "已验证"))

        missing = inbox / "missing.json"
        write(missing, base_task("T-MISSING"))
        result, _ = dispatcher.process(missing, "mock", "missing_contract")
        checks.append(("输出契约缺失拦截", result["state"] == "失败待处理" and all(x["status"] == "needs_supplement" for x in result["dispatches"])))

        timeout = inbox / "timeout.json"
        write(timeout, base_task("T-TIMEOUT"))
        result, _ = dispatcher.process(timeout, "mock", "timeout")
        checks.append(("超时进入失败待处理", result["state"] == "失败待处理"))

        real = inbox / "real.json"
        write(real, base_task("T-REAL"))
        result, _ = dispatcher.process(real, "real", "success")
        expected = "待审批" if __import__("os").environ.get("OPENAI_API_KEY") else "受阻"
        checks.append(("真实适配器凭证门禁", result["state"] == expected))
    finally:
        os.environ.pop("AMAZON_AI_OS_QUEUE_ROOT", None)
        shutil.rmtree(temp, ignore_errors=True)

    passed = sum(ok for _, ok in checks)
    for name, ok in checks:
        print(f"{'PASS' if ok else 'FAIL'} - {name}")
    print(f"Amazon-AI-OS standalone dispatcher: {passed}/{len(checks)} PASS")
    return 0 if passed == len(checks) else 2


if __name__ == "__main__":
    sys.exit(main())
