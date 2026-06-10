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

$node = (Resolve-Path ".\.codex\tools\node-v24.16.0-win-x64\node.exe").Path
$cli = (Resolve-Path ".\.codex\lark-mcp-runner-stable\node_modules\@larksuiteoapi\lark-mcp\dist\cli.js").Path

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

