# Amazon-AI-OS

本仓库是 Amazon-AI-OS 唯一正式协作核心，用于 Windows 多电脑部署、规则同步、版本追溯和团队协作。

## 正式入口

- 机器配置：`.codex/amazon-ai-os.config.json`
- Obsidian Vault：`跨境电商知识库`
- Windows 初始化：`scripts/initialize_windows.ps1`
- 新电脑验收：`scripts/acceptance_test_windows.ps1`
- 完整 Vault 加密导出：`scripts/export_compliant_vault.ps1`

完整合规 Vault 通过 AES-256 加密离线包交付。隔离资料、禁用关键词资料、密钥、令牌、本机授权状态、缓存和运行输出不得进入仓库或迁移包。

详细步骤见 [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)。
