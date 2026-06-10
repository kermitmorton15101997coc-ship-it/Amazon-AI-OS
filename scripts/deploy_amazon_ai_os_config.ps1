$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$candidate = Get-ChildItem -LiteralPath $root -Recurse -File -Filter "amazon-ai-os.config.v2.json" |
    Select-Object -First 1

if ($null -eq $candidate) {
    Write-Output "Amazon-AI-OS config deployment: BLOCKED - candidate config not found"
    exit 2
}

$target = Join-Path $root ".codex\amazon-ai-os.config.json"
$null = Get-Content -LiteralPath $candidate.FullName -Encoding utf8 -Raw | ConvertFrom-Json
Copy-Item -LiteralPath $candidate.FullName -Destination $target -Force
$deployed = Get-Content -LiteralPath $target -Encoding utf8 -Raw | ConvertFrom-Json

if ($deployed.version -ne "2026-06-06.3" -or $null -eq $deployed.workflow -or $null -eq $deployed.routing_rules) {
    Write-Output "Amazon-AI-OS config deployment: FAILED"
    exit 3
}

Write-Output "Amazon-AI-OS config deployment: PASS"
