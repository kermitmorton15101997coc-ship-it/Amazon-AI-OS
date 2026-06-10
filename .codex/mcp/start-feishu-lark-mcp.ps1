$ErrorActionPreference = "Stop"
$env:LARK_MCP_HOME = (Resolve-Path ".\.codex").Path + "\feishu-auth"
New-Item -ItemType Directory -Force -Path $env:LARK_MCP_HOME | Out-Null

if ([string]::IsNullOrWhiteSpace($env:FEISHU_APP_ID)) {
    Write-Error "Missing FEISHU_APP_ID. Set it to your Feishu/Lark app ID before starting Codex."
    exit 1
}

if ([string]::IsNullOrWhiteSpace($env:FEISHU_APP_SECRET)) {
    Write-Error "Missing FEISHU_APP_SECRET. Set it to your Feishu/Lark app secret before starting Codex."
    exit 1
}

if ([string]::IsNullOrWhiteSpace($env:LARK_DOMAIN)) {
    $env:LARK_DOMAIN = "https://open.feishu.cn"
}

if ([string]::IsNullOrWhiteSpace($env:LARK_TOKEN_MODE)) {
    $env:LARK_TOKEN_MODE = "auto"
}

if ([string]::IsNullOrWhiteSpace($env:LARK_TOOLS)) {
    $env:LARK_TOOLS = "preset.doc.default"
}

$env:APP_ID = $env:FEISHU_APP_ID
$env:APP_SECRET = $env:FEISHU_APP_SECRET

$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$systemNode = Get-Command node -ErrorAction SilentlyContinue
if ($null -ne $systemNode) {
    $node = $systemNode.Source
} else {
    $bundledNode = Get-ChildItem -Path @(
        (Join-Path $root ".codex\tools"),
        (Join-Path (Split-Path -Parent $root) ".codex\tools")
    ) -Filter "node.exe" -File -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($null -eq $bundledNode) {
        Write-Error "Node.js runtime not found. Install Node.js or run scripts/initialize_windows.ps1."
        exit 2
    }
    $node = $bundledNode.FullName
}
$cli = (Resolve-Path (Join-Path $root ".codex\lark-mcp-runner-stable\node_modules\@larksuiteoapi\lark-mcp\dist\cli.js")).Path

$tokenMode = $env:LARK_TOKEN_MODE
if ($env:FEISHU_MCP_OAUTH -in @("1", "true", "True", "TRUE", "yes", "Yes", "YES")) {
    $tokenMode = "user_access_token"
}

$arguments = @(
    $cli,
    "mcp",
    "-d",
    $env:LARK_DOMAIN,
    "-t",
    $env:LARK_TOOLS,
    "--token-mode",
    $tokenMode
)

if ($env:FEISHU_MCP_OAUTH -in @("1", "true", "True", "TRUE", "yes", "Yes", "YES")) {
    $arguments += "--oauth"
}

& $node @arguments
exit $LASTEXITCODE

