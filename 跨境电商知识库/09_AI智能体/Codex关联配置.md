# Codex 关联配置

## 当前关联

| 对象 | 本地位置 | 用途 |
|---|---|---|
| Codex 工作区 | `E:/亚马逊Codex独立团` | 执行、维护、同步、生成文件 |
| Obsidian Vault | `E:/亚马逊Codex独立团/跨境电商知识库` | Amazon-AI-OS 知识底座与唯一长期事实源 |
| 本地亚马逊资料源 | `E:/亚马逊Codex独立团/亚马逊知识库` | 原始资料来源，默认不进入 GitHub |
| Markdown 同步区 | `E:/亚马逊Codex独立团/跨境电商知识库/10_亚马逊知识库同步` | Codex 默认读取区 |
| 黑帽隔离区 | `E:/亚马逊Codex独立团/跨境电商知识库/99_隔离_黑帽资料` | 默认不得读取或执行 |
| Codex 配置 | `E:/亚马逊Codex独立团/.codex/amazon-ai-os.config.json` | 机器可读架构配置 |
| 闭环配置候选 | `E:/亚马逊Codex独立团/跨境电商知识库/09_AI智能体/amazon-ai-os.config.v2.json` | 与正式配置保持一致的受保护候选版本 |
| 嵌套副本 | `E:/亚马逊Codex独立团/Amazon-AI-OS` | 镜像/备份副本，不作为默认读取、验证或同步入口 |
| GitHub 私有仓库 | `Amazon-AI-OS` | 多电脑同步、版本追溯、成员权限管理；本地 `.gitignore` 已准备 |

## Codex 默认读取顺序

1. `AGENTS.md` 和 `.agentignore`
2. `跨境电商知识库/09_AI智能体/Amazon-AI-OS架构总控.md`
3. `跨境电商知识库/09_AI智能体/智能体岗位路由表.md`
4. 相关业务目录，例如 `01_选品体系`、`02_广告体系`、`10_亚马逊知识库同步`
5. 必要时调用卖家精灵 MCP，并标注工具名、数据来源和缺失字段
6. 飞书资料必须先同步或摘录到 Obsidian，再进入长期知识层

`Amazon-AI-OS/` 嵌套目录只作为镜像/备份识别，默认检索和验证均以根目录 `.codex` 与根目录 `跨境电商知识库` 为准。

## 闭环运行入口

- 运行规范：[[独立团协作运行规范]]
- 任务主账本：[[../08_项目管理/任务主账本/_目录]]
- 任务模板：[[../08_项目管理/任务主账本/任务记录模板]]
- 测试验收：[[闭环测试与验收]]
- 本地环境说明：[[本地环境说明]]

## 配置部署与验证

- 部署候选配置：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/deploy_amazon_ai_os_config.ps1`
- 验证闭环状态：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/validate_amazon_ai_os.ps1`
- 验证独立调度器：`powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/test_amazon_ai_os_dispatcher.ps1`
- `.codex` 受保护路径未授权时，部署脚本会失败，Vault 闭环规则仍可继续用于任务建档和分析。

## GitHub 多电脑协同

- 规则入口：[[../00_公司规则/GitHub多电脑协同规范|GitHub多电脑协同规范]]
- 忽略规则：工作区根目录 `.gitignore`
- 推荐仓库：公司私有仓库 `Amazon-AI-OS`
- 当前限制：本机未检测到系统级 Git 命令，远端仓库创建和首次推送需要在安装 GitHub Desktop/Git 后完成，或由 GitHub 管理员在网页端创建。

## 禁止绕过

- 不直接把飞书临时内容当作已沉淀知识。
- 不读取隔离区生成业务动作。
- 不使用卖家精灵 MCP 缺失字段下确定结论。
- 不用外部市场估算替代用户后台、广告、库存和成本数据。
- 不把 `Amazon-AI-OS/` 嵌套副本作为默认事实源。
