param(
    [switch]$SkipNpmInstall,
    [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "windows_deployment_common.ps1")

$tools = [ordered]@{
    Git = (Find-Git)
    Node = (Find-Node)
    Npm = (Find-Npm)
    Python = (Find-Python)
    Obsidian = (Find-Obsidian)
    SevenZip = (Find-SevenZip)
}

$missing = @()
foreach ($entry in $tools.GetEnumerator()) {
    if ([string]::IsNullOrWhiteSpace($entry.Value)) {
        Write-Output "$($entry.Key): MISSING"
        $missing += $entry.Key
    } else {
        Write-Output "$($entry.Key): $($entry.Value)"
    }
}

if (-not $SkipNpmInstall) {
    if ([string]::IsNullOrWhiteSpace($tools.Npm)) {
        Write-Error "npm is required to install the Feishu MCP runtime."
        exit 2
    }
    Push-Location (Join-Path $script:AmazonAiOsRoot ".codex\lark-mcp-runner-stable")
    try {
        & $tools.Npm ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
}

& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $script:AmazonAiOsRoot "scripts\deploy_amazon_ai_os_config.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $SkipValidation) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $script:AmazonAiOsRoot "scripts\acceptance_test_windows.ps1") -SkipToolFailure
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if ($missing.Count -gt 0) {
    Write-Output "Windows initialization: PARTIAL - install missing tools: $($missing -join ', ')"
    exit 2
}

Write-Output "Windows initialization: PASS"
