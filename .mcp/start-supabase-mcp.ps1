#!/usr/bin/env pwsh
Param()

# start-supabase-mcp.ps1
# Loads SBP_MCP_ACCESS_TOKEN from environment or .env and runs the local MCP server

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $scriptDir ".env"

# Try env var first
$token = $env:SBP_MCP_ACCESS_TOKEN

if (-not $token -and (Test-Path $envFile)) {
    foreach ($line in Get-Content $envFile) {
        if ($line -match '^\s*SBP_MCP_ACCESS_TOKEN\s*=\s*(.+)\s*$') {
            $token = $Matches[1].Trim()
            break
        }
    }
}

$cmdPath = Join-Path $scriptDir "node_modules\\.bin\\mcp-server-supabase.cmd"

if ($args -contains "--check") {
    Write-Host "tokenPresent:" ([string]::IsNullOrEmpty($token) -eq $false)
    Write-Host "tokenPreview:" ($token -replace '(.{8}).+','${1}...')
    Write-Host "cmdPath: $cmdPath"
    if (-not (Test-Path $cmdPath)) { Write-Host "cmdExists: false"; exit 3 }
    Write-Host "cmdExists: true"
    exit 0
}

if (-not $token) {
    Write-Error "Supabase access token not found. Set environment variable SBP_MCP_ACCESS_TOKEN or add it to $envFile"
    exit 2
}

if (-not (Test-Path $cmdPath)) {
    Write-Error "Supabase MCP server executable not found at: $cmdPath"
    exit 3
}

$features = "account,database,functions,storage,branching,debugging"

## Invoke the underlying cmd with token and features, forwarding stdout/stderr
& $cmdPath --access-token $token --features $features

$exitCode = $LASTEXITCODE
if ($null -eq $exitCode) { $exitCode = 0 }
exit $exitCode
