$python = Get-Command python -ErrorAction SilentlyContinue
if ($null -eq $python) {
    $bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
    if (Test-Path -LiteralPath $bundledPython) {
        $python = $bundledPython
    }
}

if ($null -eq $python) {
    Write-Output "Amazon-AI-OS validation: BLOCKED - Python runtime not found"
    exit 3
}

& $python "$PSScriptRoot\validate_amazon_ai_os.py"
exit $LASTEXITCODE
