$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$mirrorRoot = Join-Path $root "Amazon-AI-OS"
$candidates = @(
    Get-ChildItem -LiteralPath $root -Recurse -File -Filter "amazon-ai-os.config.v2.json" |
        Where-Object { -not $_.FullName.StartsWith($mirrorRoot, [StringComparison]::OrdinalIgnoreCase) }
)

if ($candidates.Count -eq 0) {
    Write-Output "Amazon-AI-OS config deployment: BLOCKED - candidate config not found"
    exit 2
}
if ($candidates.Count -ne 1) {
    Write-Output "Amazon-AI-OS config deployment: BLOCKED - candidate config is not unique"
    exit 2
}
$candidate = $candidates[0]

$target = Join-Path $root ".codex\amazon-ai-os.config.json"
$candidateConfig = Get-Content -LiteralPath $candidate.FullName -Encoding utf8 -Raw | ConvertFrom-Json
Copy-Item -LiteralPath $candidate.FullName -Destination $target -Force
$deployed = Get-Content -LiteralPath $target -Encoding utf8 -Raw | ConvertFrom-Json

if ($deployed.version -ne $candidateConfig.version -or $null -eq $deployed.workflow -or $null -eq $deployed.routing_rules) {
    Write-Output "Amazon-AI-OS config deployment: FAILED"
    exit 3
}

Write-Output "Amazon-AI-OS config deployment: PASS"
