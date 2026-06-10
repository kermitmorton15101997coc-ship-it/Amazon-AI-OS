from __future__ import annotations

import json
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
REQUIRED_FILES = [
    "跨境电商知识库/09_AI智能体/独立团协作运行规范.md",
    "跨境电商知识库/09_AI智能体/闭环测试与验收.md",
    "跨境电商知识库/08_项目管理/任务主账本/_目录.md",
    "跨境电商知识库/08_项目管理/任务主账本/任务记录模板.md",
    "跨境电商知识库/09_AI智能体/amazon-ai-os.config.v2.json",
    ".codex/amazon-ai-os.config.json",
    "scripts/deploy_amazon_ai_os_config.ps1",
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


def load_json(relative_path: str) -> dict:
    return json.loads((ROOT / relative_path).read_text(encoding="utf-8-sig"))


def main() -> int:
    failures: list[str] = []

    for relative_path in REQUIRED_FILES:
        if not (ROOT / relative_path).exists():
            failures.append(f"Missing file: {relative_path}")

    candidate = load_json("跨境电商知识库/09_AI智能体/amazon-ai-os.config.v2.json")
    for property_name in REQUIRED_PROPERTIES:
        if property_name not in candidate:
            failures.append(f"Candidate config missing property: {property_name}")

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

    deployed = load_json(".codex/amazon-ai-os.config.json")
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
