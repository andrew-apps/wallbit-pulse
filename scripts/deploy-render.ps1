# Abre el asistente de Blueprint de Render para wallbit-pulse
$repo = "https://github.com/andrew-apps/wallbit-pulse"
Write-Host "Wallbit Pulse — Render Blueprint" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repositorio: $repo"
Write-Host "Blueprint:   render.yaml (raiz)"
Write-Host "Servicios:   wallbit-pulse-api + wallbit-pulse-web"
Write-Host ""

if ($env:RENDER_API_KEY) {
    Write-Host "RENDER_API_KEY detectada. Validando blueprint..." -ForegroundColor Green
    $renderCli = Get-Command render -ErrorAction SilentlyContinue
    if ($renderCli) {
        Push-Location $PSScriptRoot\..
        render blueprints validate render.yaml
        Pop-Location
    } else {
        Write-Host "Instala Render CLI para validar: https://render.com/docs/cli" -ForegroundColor Yellow
    }
} else {
    Write-Host "RENDER_API_KEY no configurada." -ForegroundColor Yellow
    Write-Host "Crea una en: https://dashboard.render.com/u/settings#api-keys"
    Write-Host 'Luego: [System.Environment]::SetEnvironmentVariable("RENDER_API_KEY", "rnd_...", "User")'
}

Write-Host ""
Write-Host "Pasos manuales (primer deploy):" -ForegroundColor Cyan
Write-Host "  1. https://dashboard.render.com/ → New → Blueprint"
Write-Host "  2. Repo: andrew-apps/wallbit-pulse | Branch: main"
Write-Host "  3. Nombre blueprint: wallbit-pulse"
Write-Host "  4. Completa wallbit-pulse-secrets: WALLBIT_API_KEY y demas"
Write-Host "  5. Deploy Blueprint"
Write-Host ""
Start-Process "https://dashboard.render.com/blueprint/new"
