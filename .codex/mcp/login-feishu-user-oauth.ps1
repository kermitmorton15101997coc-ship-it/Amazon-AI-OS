$ErrorActionPreference = "Stop"
$env:LARK_MCP_HOME = (Resolve-Path ".\.codex").Path + "\feishu-auth"
New-Item -ItemType Directory -Force -Path $env:LARK_MCP_HOME | Out-Null

if ([string]::IsNullOrWhiteSpace($env:FEISHU_APP_ID)) {
    Write-Error "Missing FEISHU_APP_ID."
    exit 1
}

if ([string]::IsNullOrWhiteSpace($env:FEISHU_APP_SECRET)) {
    Write-Error "Missing FEISHU_APP_SECRET."
    exit 1
}

if ([string]::IsNullOrWhiteSpace($env:LARK_DOMAIN)) {
    $env:LARK_DOMAIN = "https://open.feishu.cn"
}

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

$scope = $env:FEISHU_OAUTH_SCOPE
if ([string]::IsNullOrWhiteSpace($scope)) {
    $scope = "offline_access,docx:document,wiki:wiki,drive:drive,search:search"
}

$port = $env:FEISHU_OAUTH_PORT
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "3000"
}

Write-Host "Starting Feishu OAuth login..."
Write-Host "Required redirect URL in Feishu app console: http://localhost:$port/callback"
Write-Host "Scope: $scope"

& $node $cli login `
    -a $env:FEISHU_APP_ID `
    -s $env:FEISHU_APP_SECRET `
    -d $env:LARK_DOMAIN `
    -p $port `
    --scope $scope

if ($LASTEXITCODE -ne 0) {
    Write-Error "Feishu OAuth login failed."
    exit $LASTEXITCODE
}

Write-Host "Feishu OAuth login completed."
Write-Host "Set FEISHU_MCP_OAUTH=1 before starting Codex MCP to use user identity."

