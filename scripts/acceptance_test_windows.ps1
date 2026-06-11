param([switch]$SkipToolFailure)

$ErrorActionPreference = "Continue"
. (Join-Path $PSScriptRoot "windows_deployment_common.ps1")

$failures = @()
$partials = @()
foreach ($tool in @(
    @{ Name = "Git"; Path = (Find-Git) },
    @{ Name = "Node"; Path = (Find-Node) },
    @{ Name = "Python"; Path = (Find-Python) },
    @{ Name = "Obsidian"; Path = (Find-Obsidian) },
    @{ Name = "SevenZip"; Path = (Find-SevenZip) }
)) {
    if ([string]::IsNullOrWhiteSpace($tool.Path)) {
        Write-Output "MISSING - $($tool.Name)"
        if (-not $SkipToolFailure) { $failures += $tool.Name }
    } else {
        Write-Output "PASS - $($tool.Name)"
    }
}

$checks = @(
    "scripts\test_repository_security.ps1",
    "scripts\validate_amazon_ai_os.ps1",
    "scripts\test_amazon_ai_os_dispatcher.ps1",
    "scripts\test_amazon_ai_os_workflow.ps1",
    "scripts\test_amazon_ai_os_e2e_acceptance.ps1"
)
foreach ($check in $checks) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $script:AmazonAiOsRoot $check)
    if ($LASTEXITCODE -ne 0) { $failures += $check }
}

foreach ($key in @("FEISHU_APP_ID", "FEISHU_APP_SECRET", "LARK_DOMAIN", "LARK_TOOLS", "LARK_TOKEN_MODE")) {
    if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($key))) {
        $partials += $key
        Write-Output "PARTIAL - $key is not present in this process"
    } else {
        Write-Output "PASS - $key is present"
    }
}

Write-Output "MANUAL - Complete Feishu OAuth with .codex/mcp/运行飞书用户授权.cmd"
Write-Output "MANUAL - Confirm Sellersprite MCP read-only tools are discoverable in Codex"
Write-Output "MANUAL - Open 跨境电商知识库 as the Obsidian Vault"

if ($failures.Count -gt 0) {
    Write-Output "Windows acceptance: FAILED - $($failures -join ', ')"
    exit 2
}
if ($partials.Count -gt 0) {
    Write-Output "Windows acceptance: PARTIAL - configure employee-specific credentials"
    exit 0
}
Write-Output "Windows acceptance: PASS with manual connector checks remaining"
