# Amazon-AI-OS Windows 多电脑部署

## 交付结构

- GitHub 私有仓库：`jinyanjie321-commits/Amazon-AI-OS`，作为唯一正式协作核心。
- 完整合规 Vault：通过 AES-256 加密离线包交付。
- 不交付：隔离资料、禁用关键词资料、原始资料库、密钥、令牌、授权状态、缓存和运行输出。

所有员工获得完整合规 Vault，这是老板批准的读取权限例外；角色矩阵中的智能体调用、修改和操作审批规则继续生效。

## 当前电脑导出

1. 安装 7-Zip。
2. 运行：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/export_compliant_vault.ps1 -VaultPath ..\跨境电商知识库
```

3. 在 7-Zip 提示中输入密码。脚本不会读取或保存密码。
4. 将 `.7z` 与 `.sha256` 文件交付给员工；密码通过独立渠道传递。

## 新电脑部署

1. 安装 Codex Desktop、GitHub Desktop、Obsidian、Node.js、Python 和 7-Zip。
2. 使用员工自己的 GitHub 账号克隆正式私有仓库。
3. 校验并导入 Vault：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/import_compliant_vault.ps1 `
  -ArchivePath D:\Transfer\Amazon-AI-OS-compliant-vault.7z `
  -ExpectedSha256 <SHA256>
```

4. 初始化本机：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/initialize_windows.ps1
```

5. 使用密码管理器配置 `.env.example` 中列出的飞书变量，不要创建或提交真实 `.env`。
6. 双击 `.codex/mcp/运行飞书用户授权.cmd`，使用员工自己的飞书账号完成 OAuth。
7. 在 Codex 中确认卖家精灵 MCP 只读工具可发现。
8. 用 Obsidian 打开仓库内 `跨境电商知识库`。
9. 运行最终验收：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/acceptance_test_windows.ps1
```

## 安全要求

- 不通过 GitHub、聊天或邮件传递真实密钥与 Vault 包密码。
- 新电脑验收完成前，不删除当前电脑原始 Vault。
- 仓库安全扫描、配置验证或调度器测试失败时，不得投入正式使用。
