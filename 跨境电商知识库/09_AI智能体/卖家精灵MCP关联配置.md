# 卖家精灵 MCP 关联配置

## 当前状态

- Codex 当前会话已发现卖家精灵 MCP 工具命名空间：`mcp__sellersprite_mcp`
- 卖家精灵 MCP 作为外部市场数据源接入 Amazon-AI-OS
- 输出时必须注明“数据来源：卖家精灵 MCP - 工具名”

## 核心工具路由

| 场景 | 优先工具 |
|---|---|
| 单 ASIN 详情 | `asin_detail` |
| ASIN 历史趋势 | `keepa_info`、`asin_sales_trend` |
| 类目/关键词下竞品列表 | `competitor_lookup` |
| 关联竞品 | `traffic_listing` |
| 关键词趋势 | `keyword_research_trends` |
| 类目卖家国家分布 | `market_seller_country_distribution` |
| 发货类型竞争 | `market_seller_type_concentration` |
| 优惠价格趋势 | `asin_coupon_trend`、`asin_detail_with_coupon_trend` |

## 使用纪律

- MCP 无返回时写“卖家精灵 MCP 未返回有效数据”。
- 字段为空时写明具体缺失字段。
- 不用 MCP 估算净利率、补货量、现金压力和广告利润，除非用户提供内部数据。
- 同一重大结论至少需要两个维度支持。
- 商标、侵权、合规只做初筛，不做法律结论。

详见工作区规范：`03_卖家精灵MCP工具路由规范.md`。
