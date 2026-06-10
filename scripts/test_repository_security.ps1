$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "windows_deployment_common.ps1")

$git = Find-Git
if ([string]::IsNullOrWhiteSpace($git)) {
    Write-Output "Repository security: BLOCKED - Git not found"
    exit 3
}

$tracked = @(& $git -C $script:AmazonAiOsRoot ls-files --cached --others --exclude-standard)
$failures = @()
foreach ($path in $tracked) {
    $normalized = $path.Replace("\", "/")
    if ($normalized -like ".codex/feishu-auth/*" -or
        $normalized -like ".codex/tools/*" -or
        $normalized -like "deployment-artifacts/*" -or
        $normalized -like "work/*" -or
        $normalized -like "output/*" -or
        $normalized -like "outputs/*" -or
        $normalized -like "亚马逊知识库/*" -or
        (Test-IsForbiddenRelativePath -RelativePath $normalized)) {
        $failures += $normalized
    }
}

if ($failures.Count -gt 0) {
    Write-Output "Repository security: FAILED"
    $failures | Sort-Object -Unique | ForEach-Object { Write-Output "- $_" }
    exit 2
}

Write-Output "Repository security: PASS - $($tracked.Count) tracked files checked"
