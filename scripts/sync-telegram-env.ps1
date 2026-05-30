# Sync token from root .env into backend/.env (gitignored)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$rootEnv = Join-Path $root ".env"
$backendEnv = Join-Path $root "backend\.env"
$example = Join-Path $root "backend\.env.example"

if (-not (Test-Path $backendEnv)) {
    Copy-Item $example $backendEnv
}

$token = $null
if (Test-Path $rootEnv) {
    $content = Get-Content $rootEnv -Raw
    if ($content -match '(?m)^TELEGRAM_BOT_TOKEN=(.+)$') {
        $token = $Matches[1].Trim()
    } elseif ($content -match '(\d{8,}:[A-Za-z0-9_-]{20,})') {
        $token = $Matches[1].Trim()
    }
}

if ($token) {
    $lines = Get-Content $backendEnv
    $updated = $false
    $lines = $lines | ForEach-Object {
        if ($_ -match '^TELEGRAM_BOT_TOKEN=') {
            $updated = $true
            "TELEGRAM_BOT_TOKEN=$token"
        } else {
            $_
        }
    }
    if (-not $updated) {
        $lines += "TELEGRAM_BOT_TOKEN=$token"
    }
    $lines | Set-Content $backendEnv -Encoding utf8
    Write-Host "Token sincronizado en backend/.env"
} else {
    Write-Host "No se encontro TELEGRAM_BOT_TOKEN en .env raiz"
}

Write-Host "Backend env: $backendEnv"
