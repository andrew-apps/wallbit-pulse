# Arranca backend con bot Telegram en modo polling
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location (Join-Path $root "backend")

& (Join-Path $root "scripts\sync-telegram-env.ps1")

if (-not (Test-Path ".venv")) {
    python -m venv .venv
}

& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt -q
python -m playwright install chromium

Write-Host "Iniciando backend + bot @wallbit_radar_bot (polling)..."
uvicorn app.main:app --reload --port 8000
