from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
E2E_PATH = ROOT / "跨境电商知识库/09_AI智能体/端到端验收记录.md"
ROLE_COVERAGE_PATH = ROOT / "跨境电商知识库/09_AI智能体/岗位注册覆盖对照表.md"
ROOT_TEST_PATH = ROOT / "06_测试案例与验收清单.md"
MCP_ROOT_PATH = ROOT / "03_卖家精灵MCP工具路由规范.md"
MCP_VAULT_PATH = ROOT / "跨境电商知识库/09_AI智能体/卖家精灵MCP关联配置.md"
CLOSURE_PATH = ROOT / "跨境电商知识库/09_AI智能体/闭环测试与验收.md"

REQUIRED_E2E_CASES = [f"E2E-{index:02d}" for index in range(1, 9)]
REQUIRED_AGENT_IDS = [
    "chief_of_staff",
    "ceo_decision_agent",
    "product_research_expert",
    "ads_expert",
    "ads_profit_expert",
    "inventory_expert",
    "listing_expert",
    "voc_expert",
    "customer_service_agent",
    "product_development_agent",
    "operations_director",
    "compliance_expert",
    "visual_director",
]
REQUIRED_MCP_TOOLS = [
    "product_node",
    "market_research",
    "market_research_statistics",
    "market_product_concentration",
    "market_brand_concentration",
    "market_price_distribution",
    "market_rating_distribution",
    "market_ratings_count_distribution",
    "product_research",
    "competitor_lookup",
    "asin_detail",
    "keepa_info",
    "asin_prediction",
    "traffic_listing",
    "traffic_listing_stat",
    "keyword_research",
    "keyword_miner",
    "keyword_research_trends",
    "aba_research_monthly",
    "aba_research_weekly",
    "aba_research_trend",
    "traffic_source",
    "traffic_keyword",
    "traffic_keyword_stat",
    "traffic_extend",
    "keyword_order",
    "review",
    "trademark_list",
    "trademark_detail",
    "trademark_stats",
    "trademark_country_list",
    "google_trend",
]


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def require_contains(text: str, needle: str, label: str, failures: list[str]) -> None:
    if needle not in text:
        failures.append(f"{label} missing: {needle}")


def main() -> int:
    failures: list[str] = []
    for path in [E2E_PATH, ROLE_COVERAGE_PATH, ROOT_TEST_PATH, MCP_ROOT_PATH, MCP_VAULT_PATH, CLOSURE_PATH]:
        if not path.exists():
            failures.append(f"Missing file: {path.relative_to(ROOT)}")

    if failures:
        print("Amazon-AI-OS E2E acceptance structure: PARTIAL")
        for failure in failures:
            print(f"- {failure}")
        return 2

    e2e = read(E2E_PATH)
    root_test = read(ROOT_TEST_PATH)
    role_coverage = read(ROLE_COVERAGE_PATH)
    mcp_root = read(MCP_ROOT_PATH)
    mcp_vault = read(MCP_VAULT_PATH)
    closure = read(CLOSURE_PATH)

    for case_id in REQUIRED_E2E_CASES:
        require_contains(e2e, case_id, "E2E record", failures)
        require_contains(root_test, case_id, "root test checklist", failures)

    for agent_id in REQUIRED_AGENT_IDS:
        require_contains(role_coverage, f"`{agent_id}`", "role coverage", failures)

    for tool in REQUIRED_MCP_TOOLS:
        require_contains(mcp_root, f"`{tool}`", "root MCP spec", failures)
        require_contains(mcp_vault, f"`{tool}`", "Vault MCP config", failures)

    for required_phrase in [
        "核心可运行，飞书待授权，真实业务执行需审批",
        "岗位注册覆盖对照表",
        "端到端验收记录",
        "FEISHU_APP_ID",
        "FEISHU_OAUTH_SCOPE",
    ]:
        require_contains(closure, required_phrase, "closure status", failures)

    status_values = set(re.findall(r"\| ([^|\n]+) \| 已合并承接 \|", role_coverage))
    if len(status_values) < 10:
        failures.append("role coverage should explicitly classify merged sub-roles")

    if failures:
        print("Amazon-AI-OS E2E acceptance structure: PARTIAL")
        for failure in failures:
            print(f"- {failure}")
        return 2

    print("Amazon-AI-OS E2E acceptance structure: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
