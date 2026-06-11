# 卖家精灵 MCP 关联配置

## 当前状态

- Codex 当前会话已发现卖家精灵 MCP 工具命名空间：`mcp__sellersprite_mcp`
- 卖家精灵 MCP 作为外部市场数据源接入 Amazon-AI-OS
- 输出时必须注明“数据来源：卖家精灵 MCP - 工具名”

## 核心必测工具

| 场景 | 优先工具 |
|---|---|
| 类目节点 | `product_node` |
| 类目规模 | `market_research`、`market_research_statistics` |
| 商品/品牌集中度 | `market_product_concentration`、`market_brand_concentration` |
| 价格/评分/评论门槛 | `market_price_distribution`、`market_rating_distribution`、`market_ratings_count_distribution` |
| 候选商品筛选 | `product_research`、`competitor_lookup` |
| 单 ASIN 详情 | `asin_detail` |
| ASIN 历史与销量预测 | `keepa_info`、`asin_prediction` |
| 关联竞品与流量结构 | `traffic_listing`、`traffic_listing_stat` |
| 关键词需求与挖词 | `keyword_research`、`keyword_miner`、`keyword_research_trends` |
| ABA 关键词趋势 | `aba_research_monthly`、`aba_research_weekly`、`aba_research_trend` |
| Listing/流量来源 | `traffic_source` |
| 广告与流量词 | `traffic_keyword`、`traffic_keyword_stat`、`traffic_extend`、`keyword_order` |
| Review/VOC | `review` |
| 商标与侵权初筛 | `trademark_list`、`trademark_detail`、`trademark_stats`、`trademark_country_list` |
| Google 趋势 | `google_trend` |

## 可选扩展工具

| 场景 | 工具 | 使用要求 |
|---|---|---|
| 优惠价格趋势 | `asin_coupon_trend`、`asin_detail_with_coupon_trend` | 只用于价格和促销判断，不推导净利润 |

## 使用纪律

- MCP 无返回时写“卖家精灵 MCP 未返回有效数据”。
- 字段为空时写明具体缺失字段。
- 不用 MCP 估算净利率、补货量、现金压力和广告利润，除非用户提供内部数据。
- 同一重大结论至少需要两个维度支持。
- 商标、侵权、合规只做初筛，不做法律结论。
- 未在本文件列出的工具不得写入正式 SOP；如未来 MCP 新增工具，先更新本文件和根目录路由规范，再进入任务分派。

详见工作区规范：`03_卖家精灵MCP工具路由规范.md`。
