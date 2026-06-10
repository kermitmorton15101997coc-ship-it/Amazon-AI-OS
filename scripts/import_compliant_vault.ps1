param(
    [Parameter(Mandatory = $true)][string]$ArchivePath,
    [string]$ExpectedSha256 = "",
    [string]$DestinationRoot = ""
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "windows_deployment_common.ps1")

$archive = (Resolve-Path $ArchivePath).Path
if (-not [string]::IsNullOrWhiteSpace($ExpectedSha256)) {
    $actual = (Get-FileHash -Algorithm SHA256 -LiteralPath $archive).Hash
    if ($actual -ne $ExpectedSha256.Trim()) {
        Write-Error "Vault archive SHA256 mismatch."
        exit 2
    }
}

$sevenZip = Find-SevenZip
if ([string]::IsNullOrWhiteSpace($sevenZip)) {
    Write-Error "7-Zip not found."
    exit 3
}
if ([string]::IsNullOrWhiteSpace($DestinationRoot)) {
    $DestinationRoot = $script:AmazonAiOsRoot
}
New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
$destination = (Resolve-Path $DestinationRoot).Path

Write-Output "7-Zip will request the archive password. The script does not read or store it."
& $sevenZip x $archive "-o$destination" -p -y
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Output "Vault import: PASS"
Write-Output "Destination: $destination"
