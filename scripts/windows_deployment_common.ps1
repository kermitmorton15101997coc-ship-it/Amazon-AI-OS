$script:AmazonAiOsRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Find-Executable {
    param(
        [Parameter(Mandatory = $true)][string]$Command,
        [string[]]$Candidates = @()
    )

    $resolved = Get-Command $Command -ErrorAction SilentlyContinue
    if ($null -ne $resolved) {
        return $resolved.Source
    }

    foreach ($candidate in $Candidates) {
        $items = @(Get-Item $candidate -ErrorAction SilentlyContinue)
        if ($items.Count -gt 0) {
            return $items[0].FullName
        }
    }
    return $null
}

function Find-Python {
    return Find-Executable -Command "python" -Candidates @(
        (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"),
        "C:\Program Files\Python*\python.exe",
        (Join-Path $env:LOCALAPPDATA "Programs\Python\Python*\python.exe")
    )
}

function Find-Node {
    $node = Find-Executable -Command "node" -Candidates @(
        "C:\Program Files\nodejs\node.exe",
        (Join-Path $script:AmazonAiOsRoot ".codex\tools\*\node.exe"),
        (Join-Path (Split-Path -Parent $script:AmazonAiOsRoot) ".codex\tools\*\node.exe")
    )
    return $node
}

function Find-Npm {
    return Find-Executable -Command "npm.cmd" -Candidates @(
        "C:\Program Files\nodejs\npm.cmd",
        (Join-Path $script:AmazonAiOsRoot ".codex\tools\*\npm.cmd"),
        (Join-Path (Split-Path -Parent $script:AmazonAiOsRoot) ".codex\tools\*\npm.cmd")
    )
}

function Find-Git {
    return Find-Executable -Command "git" -Candidates @(
        "C:\Program Files\Git\cmd\git.exe",
        (Join-Path $env:LOCALAPPDATA "GitHubDesktop\app-*\resources\app\git\cmd\git.exe")
    )
}

function Find-SevenZip {
    return Find-Executable -Command "7z" -Candidates @(
        "C:\Program Files\7-Zip\7z.exe",
        "C:\Program Files (x86)\7-Zip\7z.exe",
        (Join-Path $script:AmazonAiOsRoot ".codex\tools\7zip\7zr.exe"),
        (Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages\*\7z.exe")
    )
}

function Find-Obsidian {
    return Find-Executable -Command "Obsidian" -Candidates @(
        (Join-Path $env:LOCALAPPDATA "Obsidian\Obsidian.exe"),
        "C:\Program Files\Obsidian\Obsidian.exe",
        "D:\徐依伊\Obsidian\Obsidian.exe"
    )
}

function Get-ForbiddenKeywords {
    return @(
        "黑帽", "恶搞", "赶跟卖", "删差评", "差评移除", "种子评论", "僵尸评论",
        "僵尸链接", "翻新", "黑科技", "多开节点", "突破限制", "测评实操",
        "卡视频", "无限秒杀投诉"
    )
}

function Test-IsForbiddenRelativePath {
    param([Parameter(Mandatory = $true)][string]$RelativePath)

    $normalized = $RelativePath.Replace("\", "/")
    if ($normalized -like "99_隔离_黑帽资料/*") { return $true }
    if ($normalized -like ".obsidian/workspace*.json") { return $true }
    if ($normalized -like ".obsidian/cache/*") { return $true }
    if ($normalized -like ".trash/*") { return $true }
    if ($normalized -ne ".env.example" -and $normalized -match "(^|/)\.env($|\.)") { return $true }
    if ($normalized -match "(?i)(^|/)[^/]*(secret|token)[^/]*$") { return $true }
    if ($normalized -match "(?i)\.(key|pem)$") { return $true }

    foreach ($keyword in Get-ForbiddenKeywords) {
        if ($normalized.Contains($keyword)) { return $true }
    }
    return $false
}
