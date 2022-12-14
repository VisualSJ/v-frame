#Requires -Version "6.1"

Write-Host @"
Current working directory: $(Get-Location)
Environment vars
-------
GITHUB_SHA: $env:GITHUB_SHA
GITHUB_BASE_REF: $env:GITHUB_BASE_REF
GITHUB_EVENT_PATH: $env:GITHUB_EVENT_PATH
"@

$diffFilter = "d" # Exclude deleted diff

# https://github.community/t/check-pushed-file-changes-with-git-diff-tree-in-github-actions/17220/10
if ($env:GITHUB_BASE_REF) {
    # Pull Request
    git fetch origin $env:GITHUB_BASE_REF --depth=1
    $diffFiles = git diff --name-only --diff-filter=$diffFilter origin/$env:GITHUB_BASE_REF $env:GITHUB_SHA
} else {
    # Push
    $gitHubEvent = Get-Content $env:GITHUB_EVENT_PATH | ConvertFrom-Json
    Write-Host "GitHub event: $gitHubEvent"
    git fetch origin $gitHubEvent.before --depth=1
    $diffFiles = git diff --name-only --diff-filter=$diffFilter $gitHubEvent.before $env:GITHUB_SHA
}

if (-not $diffFiles) {
    # Write-Error "Seems like we got zero diffs?"
    Write-Host "Nothing"
    return
}

Write-Host "Diff files:"
foreach ($file in $diffFiles.Split('\n')) {
    Write-Host "$file"
}

foreach ($file in $diffFiles.Split('\n')) {
    $extension = Split-Path -Extension -Path $file
    $contTs = ($extension -eq ".ts")
    $contJs = ($extension -eq ".js")
    if (-not ($contTs -or $contJs)) {
        Write-Host "Skip $file"
        continue
    }
    Write-Host "ESLint check $file"
    npx eslint $file
}
