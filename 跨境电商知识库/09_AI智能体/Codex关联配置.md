# Codex 关联配置

## 当前关联

| 对象 | 本地位置 | 用途 |
|---|---|---|
| Codex 正式工作区 | 正式仓库根目录 | 执行、维护、同步、生成文件 |
| Obsidian Vault | `跨境电商知识库` | Amazon-AI-OS 知识底座 |
| Markdown 同步区 | `跨境电商知识库/10_亚马逊知识库同步` | Codex 默认读取区 |
| 黑帽隔离区 | `跨境电商知识库/99_隔离_黑帽资料` | 默认不得读取或执行 |
| Codex 配置 | `.codex/amazon-ai-os.config.json` | 机器可读架构配置 |
| 闭环配置候选 | `跨境电商知识库/09_AI智能体/amazon-ai-os.config.v2.json` | 受保护配置待部署时的正式候选版本 |
| GitHub 私有仓库 | `https://github.com/jinyanjie321-commits/Amazon-AI-OS` | 多电脑同步、版本追溯、成员权限管理 |

## Codex 默认读取顺序

1. `AGENTS.md` 和 `.agentignore`
2. `.codex/amazon-ai-os.config.json`
3. `跨境电商知识库/09_AI智能体/Amazon-AI-OS架构总控.md`
4. `跨境电商知识库/09_AI智能体/智能体岗位路由表.md`
5. 相关业务目录，例如 `01_选品体系`、`02_广告体系`、`10_亚马逊知识库同步`
6. 必要时调用卖家精灵 MCP，并标注数据来源与缺失字段
7. 飞书资料必须先同步或摘录到 Obsidian，再进入长期知识层

## 闭环运行入口

- 运行规范：[[独立团协作运行规范]]
- 任务主账本：[[../08_项目管理/任务主账本/_目录]]
- 任务模板：[[../08_项目管理/任务主账本/任务记录模板]]
- 测试验收：[[闭环测试与验收]]

## 配置部署与验证

- 部署候选配置：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/deploy_amazon_ai_os_config.ps1`
- 验证闭环状态：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/validate_amazon_ai_os.ps1`
- 调度器测试：`python scripts/test_amazon_ai_os_dispatcher.py`
- 工作流测试：`python scripts/test_amazon_ai_os_workflow.py`
- `.codex` 受保护路径未授权时，部署脚本会失败，Vault 闭环规则仍可继续用于任务建档和分析。

## GitHub 多电脑协同

- 规则入口：[[../00_公司规则/GitHub多电脑协同规范|GitHub多电脑协同规范]]
- 忽略规则：正式仓库根目录 `.gitignore`
- 正式仓库：公司私有仓库 `jinyanjie321-commits/Amazon-AI-OS`
- 员工电脑：使用 GitHub Desktop 克隆正式仓库后，打开仓库内的 Obsidian Vault。
- 完整合规 Vault：通过 AES-256 加密离线包交付，所有员工可读取；角色修改权限和审批规则保持不变。

## 禁止绕过

- 不直接把飞书临时内容当作已沉淀知识。
- 不读取隔离区生成业务动作。
- 不使用卖家精灵 MCP 缺失字段下确定结论。
- 不用外部市场估算替代用户后台、广告、库存和成本数据。
