param(
    [string]$VaultPath = "",
    [string]$OutputDirectory = "",
    [switch]$PrepareOnly
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "windows_deployment_common.ps1")

if ([string]::IsNullOrWhiteSpace($VaultPath)) {
    $VaultPath = Join-Path $script:AmazonAiOsRoot "跨境电商知识库"
}
$vault = (Resolve-Path $VaultPath).Path
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $OutputDirectory = Join-Path $script:AmazonAiOsRoot "deployment-artifacts"
}
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$output = (Resolve-Path $OutputDirectory).Path

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$stageRoot = Join-Path $output "vault-stage-$stamp"
$stageVault = Join-Path $stageRoot "跨境电商知识库"
New-Item -ItemType Directory -Force -Path $stageVault | Out-Null

$included = @()
$excluded = @()
foreach ($file in Get-ChildItem -LiteralPath $vault -File -Recurse -Force) {
    $relative = $file.FullName.Substring($vault.Length).TrimStart("\")
    if (Test-IsForbiddenRelativePath -RelativePath $relative) {
        $excluded += [pscustomobject]@{ Path = $relative; Reason = "security-exclusion" }
        continue
    }
    $destination = Join-Path $stageVault $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $destination) | Out-Null
    Copy-Item -LiteralPath $file.FullName -Destination $destination -Force
    $included += [pscustomobject]@{
        Path = $relative
        Bytes = $file.Length
        SHA256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $file.FullName).Hash
    }
}

$manifestPath = Join-Path $stageRoot "manifest.csv"
$excludedPath = Join-Path $stageRoot "excluded.csv"
$included | Sort-Object Path | Export-Csv -LiteralPath $manifestPath -NoTypeInformation -Encoding UTF8
$excluded | Sort-Object Path | Export-Csv -LiteralPath $excludedPath -NoTypeInformation -Encoding UTF8
$summary = [ordered]@{
    created_at = (Get-Date).ToString("o")
    source_vault = $vault
    included_files = $included.Count
    included_bytes = ($included | Measure-Object Bytes -Sum).Sum
    excluded_files = $excluded.Count
    archive_encryption = "7-Zip AES-256 with encrypted filenames"
}
$summary | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $stageRoot "summary.json") -Encoding UTF8

Write-Output "Vault staging: PASS"
Write-Output "Stage: $stageRoot"
Write-Output "Included files: $($included.Count)"
Write-Output "Excluded files: $($excluded.Count)"

if ($PrepareOnly) {
    Write-Output "Archive creation skipped. Run again without -PrepareOnly to create the encrypted archive."
    exit 0
}

$sevenZip = Find-SevenZip
if ([string]::IsNullOrWhiteSpace($sevenZip)) {
    Write-Output "Vault archive: BLOCKED - 7-Zip not found"
    exit 3
}

$archive = Join-Path $output "Amazon-AI-OS-compliant-vault-$stamp.7z"
Write-Output "7-Zip will request the archive password twice. The script does not read or store it."
Push-Location $stageRoot
try {
    & $sevenZip a -t7z $archive ".\*" -mhe=on -p
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

$archiveHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archive).Hash
"$archiveHash  $([IO.Path]::GetFileName($archive))" | Set-Content -LiteralPath "$archive.sha256" -Encoding ASCII
Write-Output "Vault archive: PASS"
Write-Output "Archive: $archive"
Write-Output "SHA256: $archiveHash"
