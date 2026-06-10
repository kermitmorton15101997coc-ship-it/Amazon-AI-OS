# GitHub多电脑协同规范

## 仓库

- 仓库名称：`Amazon-AI-OS`
- 仓库类型：公司私有仓库
- 初始来源：当前工作区 `E:/亚马逊Codex独立团`
- 同步工具：GitHub Desktop 或 Git

## 同步规则

- 每次修改 SOP、模板、Agent 提示词或配置后，必须提交到 GitHub。
- 员工电脑每天开始工作前先同步，提交前先拉取最新版本。
- 大体积运行包、输出文件、缓存、密钥和本机授权状态不进入 GitHub。
- `.gitignore` 已排除本地缓存、输出目录、临时队列和敏感文件。

## 分支建议

- `main`：稳定规则与模板。
- `ops/sop-update`：运营主管维护 SOP。
- `ads/report-template`：广告模板调整。
- `ai/agent-config`：Agent 注册表、路由和提示词调整。

## 老板审批项

- 创建公司私有仓库。
- 邀请或移除成员。
- 设置团队权限和目录访问策略。
- 决定员工是否可克隆完整 Vault。
