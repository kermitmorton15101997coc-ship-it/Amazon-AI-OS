from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent.parent
CANDIDATE_CONFIG = "跨境电商知识库/09_AI智能体/amazon-ai-os.config.v2.json"
DEPLOYED_CONFIG = ".codex/amazon-ai-os.config.json"
RUNBOOK_PATH = "跨境电商知识库/09_AI智能体/独立团协作运行规范.md"
CLOSURE_PATH = "跨境电商知识库/09_AI智能体/闭环测试与验收.md"
REQUIRED_FILES = [
    ".agentignore",
    RUNBOOK_PATH,
    CLOSURE_PATH,
    "跨境电商知识库/09_AI智能体/岗位注册覆盖对照表.md",
    "跨境电商知识库/09_AI智能体/端到端验收记录.md",
    "跨境电商知识库/09_AI智能体/Codex关联配置.md",
    "跨境电商知识库/09_AI智能体/本地环境说明.md",
    "跨境电商知识库/08_项目管理/任务主账本/_目录.md",
    "跨境电商知识库/08_项目管理/任务主账本/任务记录模板.md",
    CANDIDATE_CONFIG,
    DEPLOYED_CONFIG,
    "scripts/deploy_amazon_ai_os_config.ps1",
]
FORBIDDEN_PATH_KEYWORDS = [
    "黑帽",
    "恶搞",
    "赶跟卖",
    "删差评",
    "差评移除",
    "种子评论",
    "僵尸评论",
    "僵尸链接",
    "翻新",
    "黑科技",
    "多开节点",
    "突破限制",
    "测评实操",
    "卡视频",
    "无限秒杀投诉",
]
REQUIRED_PROPERTIES = [
    "source_of_truth",
    "task_ledger",
    "queue_root",
    "approval_mode",
    "states",
    "state_transitions",
    "workflow",
    "approval_policy",
    "mcp_policy",
    "agent_registry",
    "routing_rules",
    "dispatch_policy",
    "task_schema",
    "dispatch_record_schema",
    "result_contract",
    "agent_output_contract",
    "closure_gates",
    "core_agents",
    "role_permission_matrix",
    "github_policy",
]
REQUIRED_STATES = ["待分析", "待审批", "执行准备", "测试中", "已验证", "受阻", "已关闭"]
REQUIRED_SCENARIOS = [
    "asin_full_diagnosis",
    "product_selection_screening",
    "ads_diagnosis",
    "inventory_replenishment",
    "listing_optimization",
    "review_analysis",
    "customer_service_response",
    "product_development",
    "ceo_decision_review",
    "compliance_review",
]
REQUIRED_CORE_AGENTS = [
    "ceo_decision_agent",
    "product_research_expert",
    "ads_expert",
    "inventory_expert",
    "listing_expert",
    "voc_expert",
    "customer_service_agent",
    "product_development_agent",
]
REQUIRED_ROLES = [
    "owner",
    "operations_manager",
    "operations_assistant",
    "ads_specialist",
    "customer_service",
    "supply_chain",
]


def load_json(relative_path: str) -> dict[str, Any]:
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8-sig"))


def walk_strings(value: Any, path: str = "config") -> list[tuple[str, str]]:
    if isinstance(value, str):
        return [(path, value)]
    if isinstance(value, list):
        found: list[tuple[str, str]] = []
        for index, item in enumerate(value):
            found.extend(walk_strings(item, f"{path}[{index}]"))
        return found
    if isinstance(value, dict):
        found = []
        for key, item in value.items():
            found.extend(walk_strings(item, f"{path}.{key}"))
        return found
    return []


def has_corrupt_placeholder(text: str) -> bool:
    return "??" in text or "�" in text


def resolve_prompt_file(ref: str) -> Path | None:
    ref_path = ref.split("#", 1)[0]
    candidates = [
        ROOT / ref_path,
        ROOT / "跨境电商知识库/09_AI智能体" / ref_path,
        ROOT / "跨境电商知识库" / ref_path,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def markdown_headings(path: Path) -> set[str]:
    headings: set[str] = set()
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        match = re.match(r"^\s{0,3}#{1,6}\s+(.+?)\s*#*\s*$", line)
        if match:
            headings.add(match.group(1).strip())
    return headings


def validate_prompt_refs(config: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    for agent in config.get("agent_registry", []):
        ref = agent.get("prompt_ref", "")
        agent_id = agent.get("id", "<missing-id>")
        path = resolve_prompt_file(ref)
        if path is None:
            failures.append(f"Agent prompt_ref file not found: {agent_id} -> {ref}")
            continue
        if "#" in ref:
            anchor = ref.split("#", 1)[1].strip()
            if anchor not in markdown_headings(path):
                failures.append(f"Agent prompt_ref anchor not found: {agent_id} -> {ref}")
    return failures


def validate_role_paths(config: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    for role in config.get("role_permission_matrix", []):
        role_id = role.get("id", "<missing-role>")
        for field in ("read_paths", "edit_paths"):
            for raw_path in role.get(field, []):
                path = ROOT / raw_path
                if not path.exists():
                    failures.append(f"Role {field} does not exist: {role_id} -> {raw_path}")
    return failures


def validate_status_docs(config: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    closure = (ROOT / CLOSURE_PATH).read_text(encoding="utf-8-sig")
    if config.get("version") not in closure:
        failures.append("Closure document does not mention current config version")
    sellersprite_state = config.get("capabilities", {}).get("sellersprite_mcp")
    if sellersprite_state == "available_read_only_verified" and "命名空间可发现" not in closure:
        failures.append("Closure document does not match current Sellersprite MCP state")
    feishu_state = config.get("capabilities", {}).get("feishu_lark")
    if feishu_state == "configured_waiting_user_access":
        for key in ("FEISHU_APP_ID", "FEISHU_APP_SECRET", "LARK_DOMAIN", "LARK_TOOLS", "LARK_TOKEN_MODE", "FEISHU_OAUTH_SCOPE"):
            if key not in closure:
                failures.append(f"Closure document does not mention pending Feishu/Lark variable: {key}")
    for required in ("岗位注册覆盖对照表", "端到端验收记录", "核心可运行，飞书待授权，真实业务执行需审批"):
        if required not in closure:
            failures.append(f"Closure document missing current remediation status: {required}")
    if "PARTIAL：正式 `.codex` 配置未部署 v2" in closure:
        failures.append("Closure document still contains stale v2 deployment warning")
    return failures


def validate_agentignore() -> list[str]:
    failures: list[str] = []
    lines = {
        line.strip()
        for line in (ROOT / ".agentignore").read_text(encoding="utf-8-sig").splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    }
    required_paths = {
        "亚马逊知识库/账号安全/黑帽玩法/",
        "跨境电商知识库/99_隔离_黑帽资料/",
    }
    if (ROOT / "Amazon-AI-OS").exists():
        required_paths.add("Amazon-AI-OS/")
    for path in sorted(required_paths - lines):
        failures.append(f".agentignore missing protected path: {path}")
    for root in ("亚马逊知识库", "跨境电商知识库"):
        for keyword in FORBIDDEN_PATH_KEYWORDS:
            pattern = f"{root}/**/*{keyword}*"
            if pattern not in lines:
                failures.append(f".agentignore missing forbidden keyword pattern: {pattern}")
    return failures


def main() -> int:
    failures: list[str] = []

    for relative_path in REQUIRED_FILES:
        if not (ROOT / relative_path).exists():
            failures.append(f"Missing file: {relative_path}")

    candidate = load_json(CANDIDATE_CONFIG)
    for property_name in REQUIRED_PROPERTIES:
        if property_name not in candidate:
            failures.append(f"Candidate config missing property: {property_name}")

    for path, value in walk_strings(candidate):
        if has_corrupt_placeholder(value):
            failures.append(f"Corrupt placeholder found: {path}={value}")

    for state in REQUIRED_STATES:
        if state not in candidate.get("states", []):
            failures.append(f"State machine missing state: {state}")

    registered = {agent["id"] for agent in candidate.get("agent_registry", [])}
    for agent_id in REQUIRED_CORE_AGENTS:
        if agent_id not in registered:
            failures.append(f"Core agent is not registered: {agent_id}")

    configured_core_agents = set(candidate.get("core_agents", []))
    for agent_id in REQUIRED_CORE_AGENTS:
        if agent_id not in configured_core_agents:
            failures.append(f"core_agents missing: {agent_id}")

    configured_roles = {role["id"] for role in candidate.get("role_permission_matrix", [])}
    for role_id in REQUIRED_ROLES:
        if role_id not in configured_roles:
            failures.append(f"Role permission matrix missing role: {role_id}")

    scenarios = {rule["scenario"] for rule in candidate.get("routing_rules", [])}
    for scenario in REQUIRED_SCENARIOS:
        if scenario not in scenarios:
            failures.append(f"Routing rules missing scenario: {scenario}")
    for rule in candidate.get("routing_rules", []):
        for agent_id in [rule["primary"], *rule["collaborators"]]:
            if agent_id not in registered:
                failures.append(f"Routing rule references unregistered agent: {agent_id}")

    required_contract = set(candidate.get("result_contract", []))
    if required_contract != set(candidate.get("agent_output_contract", [])):
        failures.append("result_contract and agent_output_contract do not match")

    failures.extend(validate_prompt_refs(candidate))
    failures.extend(validate_role_paths(candidate))
    failures.extend(validate_status_docs(candidate))
    failures.extend(validate_agentignore())

    deployed = load_json(DEPLOYED_CONFIG)
    if deployed != candidate:
        failures.append("Formal machine config does not exactly match candidate config: .codex/amazon-ai-os.config.json")

    if failures:
        print("Amazon-AI-OS validation: PARTIAL")
        for failure in failures:
            print(f"- {failure}")
        return 2

    print("Amazon-AI-OS validation: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
