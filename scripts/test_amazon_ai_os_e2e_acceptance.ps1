$python = Get-Command python -ErrorAction SilentlyContinue
if ($null -eq $python) {
    $bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if (Test-Path -LiteralPath $bundledPython) {
        $python = $bundledPython
    }
}

if ($null -eq $python) {
    Write-Output "Amazon-AI-OS E2E acceptance structure: BLOCKED - Python runtime not found"
    exit 3
}

& $python "$PSScriptRoot\test_amazon_ai_os_e2e_acceptance.py"
exit $LASTEXITCODE
