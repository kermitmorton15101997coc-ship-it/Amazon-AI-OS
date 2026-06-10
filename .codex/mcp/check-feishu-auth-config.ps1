$ErrorActionPreference = "Stop"

$keys = @(
    "FEISHU_APP_ID",
    "FEISHU_APP_SECRET",
    "LARK_DOMAIN",
    "LARK_TOOLS",
    "LARK_TOKEN_MODE",
    "FEISHU_MCP_OAUTH",
    "FEISHU_OAUTH_SCOPE"
)

foreach ($key in $keys) {
    $value = [Environment]::GetEnvironmentVariable($key)
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "$key=missing"
    } else {
        Write-Host "$key=present"
    }
}

Write-Host "Feishu MCP start script: .codex/mcp/start-feishu-lark-mcp.ps1"
Write-Host "Feishu OAuth login script: .codex/mcp/login-feishu-user-oauth.ps1"
