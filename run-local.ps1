param(
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting HRM FE local dev server" -ForegroundColor Cyan
Write-Host "Project: $projectRoot" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js not found. Please install Node.js first and reopen terminal."
    exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm not found. Please install Node.js first and reopen terminal."
    exit 1
}

if (-not (Test-Path "$projectRoot\node_modules")) {
    Write-Host "Dependencies not installed yet. Running npm install --legacy-peer-deps..." -ForegroundColor Yellow
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Error "npm install failed."
        exit $LASTEXITCODE
    }
}

# react-scripts reads HOST/PORT from env
$env:HOST = "0.0.0.0"
$env:PORT = "$Port"

Write-Host "Launching app on http://localhost:$Port ..." -ForegroundColor Green
npm start
