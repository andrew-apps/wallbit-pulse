# Bootstrap git history with ~100 atomic commits (Conventional Commits)
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Commit-Files {
    param(
        [string]$Message,
        [string[]]$Paths
    )
    if ($Paths.Count -eq 0) { return }
    $existing = @()
    foreach ($p in $Paths) {
        if (Test-Path -LiteralPath $p) { $existing += $p }
    }
    if ($existing.Count -eq 0) { return }
    git add -- $existing
    git commit -m $Message | Out-Null
    Write-Host "OK: $Message"
}

# ── 1. Fundación ────────────────────────────────────────────────────
Commit-Files "chore: add root gitignore for monorepo" @(".gitignore")
Commit-Files "docs: add README with setup and demo flow" @("README.md")
Commit-Files "docs: add Wallbit Pulse AI product blueprint" @("docs/WALLBIT_PULSE_AI_BLUEPRINT.md")

# ── 2. Backend bootstrap ────────────────────────────────────────────
Commit-Files "chore(backend): add Python dependencies manifest" @("backend/requirements.txt")
Commit-Files "chore(backend): add environment variables template" @("backend/.env.example")
Commit-Files "feat(backend): scaffold app package" @("backend/app/__init__.py")
Commit-Files "feat(backend): add application settings module" @("backend/app/config.py")
Commit-Files "feat(backend): add SQLite database bootstrap" @("backend/app/database.py")
Commit-Files "feat(backend): add FastAPI application entrypoint" @("backend/app/main.py")

# ── 3. Backend models ───────────────────────────────────────────────
Commit-Files "feat(backend): add pydantic models package" @("backend/app/models/__init__.py")
Commit-Files "feat(backend): add user domain model" @("backend/app/models/user.py")
Commit-Files "feat(backend): add alert domain model" @("backend/app/models/alert.py")
Commit-Files "feat(backend): add audit log domain model" @("backend/app/models/audit_log.py")
Commit-Files "feat(backend): add forecast domain model" @("backend/app/models/forecast.py")
Commit-Files "feat(backend): add recommendation domain model" @("backend/app/models/recommendation.py")
Commit-Files "feat(backend): add telegram link domain model" @("backend/app/models/telegram_link.py")
Commit-Files "feat(backend): add trade domain model" @("backend/app/models/trade.py")

# ── 4. Backend ML ───────────────────────────────────────────────────
Commit-Files "feat(backend): add ML analytics package" @("backend/app/ml/__init__.py")
Commit-Files "feat(backend): add feature engineering for scoring" @("backend/app/ml/features.py")
Commit-Files "feat(backend): add Monte Carlo forecast engine" @("backend/app/ml/monte_carlo.py")
Commit-Files "feat(backend): add investment scoring module" @("backend/app/ml/scoring.py")

# ── 5. Backend services ─────────────────────────────────────────────
Commit-Files "feat(backend): add services package" @("backend/app/services/__init__.py")
Commit-Files "feat(backend): add Wallbit API client service" @("backend/app/services/wallbit_client.py")
Commit-Files "feat(backend): add market data service" @("backend/app/services/market_data_service.py")
Commit-Files "feat(backend): add security and encryption service" @("backend/app/services/security_service.py")
Commit-Files "feat(backend): add forecast computation service" @("backend/app/services/forecast_service.py")
Commit-Files "feat(backend): add investment score service" @("backend/app/services/investment_score_service.py")
Commit-Files "feat(backend): add alert engine service" @("backend/app/services/alert_engine.py")
Commit-Files "feat(backend): add alert persistence service" @("backend/app/services/alert_service.py")
Commit-Files "feat(backend): add trade execution service" @("backend/app/services/trade_service.py")
Commit-Files "feat(backend): add Telegram bot service" @("backend/app/services/telegram_service.py")
Commit-Files "feat(backend): add risk report service" @("backend/app/services/report_service.py")
Commit-Files "feat(backend): add Playwright screenshot service" @("backend/app/services/screenshot_service.py")

# ── 6. Backend routes ───────────────────────────────────────────────
Commit-Files "feat(backend): add API routes package" @("backend/app/routes/__init__.py")
Commit-Files "feat(backend): add Wallbit connect endpoint" @("backend/app/routes/connect.py")
Commit-Files "feat(backend): add dashboard pulse endpoint" @("backend/app/routes/dashboard.py")
Commit-Files "feat(backend): add forecast simulation endpoint" @("backend/app/routes/forecast.py")
Commit-Files "feat(backend): add investment ranking endpoint" @("backend/app/routes/ranking.py")
Commit-Files "feat(backend): add alerts CRUD endpoint" @("backend/app/routes/alerts.py")
Commit-Files "feat(backend): add trade confirmation endpoint" @("backend/app/routes/trades.py")
Commit-Files "feat(backend): add Telegram link endpoint" @("backend/app/routes/telegram.py")
Commit-Files "feat(backend): add risk report and Telegram send endpoint" @("backend/app/routes/reports.py")

# ── 7. Frontend toolchain ───────────────────────────────────────────
Commit-Files "chore(front): add Next.js gitignore" @("front/.gitignore")
Commit-Files "chore(front): initialize package manifest and lockfile" @("front/package.json", "front/pnpm-lock.yaml")
Commit-Files "chore(front): add TypeScript configuration" @("front/tsconfig.json", "front/next-env.d.ts")
Commit-Files "chore(front): add Next.js application config" @("front/next.config.mjs")
Commit-Files "chore(front): add ESLint configuration" @("front/eslint.config.mjs")
Commit-Files "chore(front): add PostCSS and Tailwind setup" @("front/postcss.config.mjs")
Commit-Files "chore(front): add shadcn/ui components configuration" @("front/components.json")

# ── 8. Frontend lib & hooks ─────────────────────────────────────────
Commit-Files "feat(front): add shared TypeScript types" @("front/lib/types.ts")
Commit-Files "feat(front): add utility helpers" @("front/lib/utils.ts")
Commit-Files "feat(front): add number and date formatters" @("front/lib/format.ts")
Commit-Files "feat(front): add demo data fixtures" @("front/lib/data.ts")
Commit-Files "feat(front): add backend API client" @("front/lib/api.ts")
Commit-Files "feat(front): add mobile breakpoint hook" @("front/hooks/use-mobile.ts")
Commit-Files "feat(front): add toast notification hook" @("front/hooks/use-toast.ts")

# ── 9. UI primitives (shadcn) — batches ─────────────────────────────
$uiBatches = @(
    @("button.tsx", "input.tsx", "label.tsx", "textarea.tsx", "checkbox.tsx", "switch.tsx", "badge.tsx"),
    @("card.tsx", "separator.tsx", "skeleton.tsx", "spinner.tsx", "progress.tsx", "avatar.tsx", "aspect-ratio.tsx"),
    @("alert.tsx", "alert-dialog.tsx", "dialog.tsx", "drawer.tsx", "sheet.tsx", "popover.tsx", "tooltip.tsx"),
    @("dropdown-menu.tsx", "context-menu.tsx", "menubar.tsx", "navigation-menu.tsx", "command.tsx", "breadcrumb.tsx"),
    @("tabs.tsx", "accordion.tsx", "collapsible.tsx", "toggle.tsx", "toggle-group.tsx", "radio-group.tsx", "select.tsx"),
    @("table.tsx", "pagination.tsx", "scroll-area.tsx", "resizable.tsx", "slider.tsx", "calendar.tsx", "form.tsx"),
    @("field.tsx", "input-group.tsx", "input-otp.tsx", "button-group.tsx", "item.tsx", "empty.tsx", "kbd.tsx"),
    @("chart.tsx", "carousel.tsx", "hover-card.tsx", "sonner.tsx", "toast.tsx", "toaster.tsx", "use-toast.ts"),
    @("sidebar.tsx", "use-mobile.tsx")
)
$batchNum = 1
foreach ($batch in $uiBatches) {
    $paths = $batch | ForEach-Object { "front/components/ui/$_" }
    Commit-Files "feat(front): add shadcn ui primitives batch $batchNum" $paths
    $batchNum++
}

# ── 10. Domain components ───────────────────────────────────────────
Commit-Files "feat(front): add theme provider" @("front/components/theme-provider.tsx")
Commit-Files "feat(front): add brand logo component" @("front/components/logo.tsx")
Commit-Files "feat(front): add minimal app header" @("front/components/MinimalHeader.tsx")
Commit-Files "feat(front): add app shell layout" @("front/components/app-shell.tsx")
Commit-Files "feat(front): add regulatory disclaimer banner" @("front/components/DisclaimerBanner.tsx")
Commit-Files "feat(front): add Wallbit connect card" @("front/components/ConnectWallbitCard.tsx")
Commit-Files "feat(front): add Telegram connect card" @("front/components/TelegramConnectCard.tsx")
Commit-Files "feat(front): add pulse summary card" @("front/components/PulseSummaryCard.tsx")
Commit-Files "feat(front): add risk level card" @("front/components/RiskLevelCard.tsx")
Commit-Files "feat(front): add main alert card" @("front/components/MainAlertCard.tsx")
Commit-Files "feat(front): add opportunity card" @("front/components/OpportunityCard.tsx")
Commit-Files "feat(front): add risk badge component" @("front/components/risk-badge.tsx")
Commit-Files "feat(front): add risk snapshot card" @("front/components/RiskSnapshotCard.tsx")
Commit-Files "feat(front): add forecast simulator" @("front/components/ForecastSimulator.tsx")
Commit-Files "feat(front): add scenario comparison cards" @("front/components/ScenarioCards.tsx")
Commit-Files "feat(front): add investment ranking table" @("front/components/InvestmentRanking.tsx")
Commit-Files "feat(front): add Telegram message preview" @("front/components/TelegramPreview.tsx")
Commit-Files "feat(front): add trade confirmation modal" @("front/components/TradeConfirmationModal.tsx")
Commit-Files "feat(front): add trade modal wrapper" @("front/components/trade-modal.tsx")
Commit-Files "feat(front): add dashboard balance cards" @("front/components/dashboard/balance-cards.tsx")
Commit-Files "feat(front): add portfolio allocation donut chart" @("front/components/dashboard/allocation-donut.tsx")
Commit-Files "feat(front): add performance line chart" @("front/components/dashboard/performance-chart.tsx")

# ── 11. Styles & assets ─────────────────────────────────────────────
Commit-Files "style(front): add global CSS design tokens" @("front/app/globals.css")
Commit-Files "style(front): add alternate global stylesheet" @("front/styles/globals.css")
Commit-Files "chore(front): add brand icon asset" @("front/public/icon.svg")
Commit-Files "chore(front): add placeholder logo asset" @("front/public/placeholder-logo.svg")
Commit-Files "chore(front): add placeholder illustration asset" @("front/public/placeholder.svg")

# Check for PNG icons
Get-ChildItem -Path "front/public" -Filter "*.png" -ErrorAction SilentlyContinue | ForEach-Object {
    Commit-Files "chore(front): add public icon $($_.Name)" @($_.FullName.Replace((Get-Location).Path + "\", "").Replace("\", "/"))
}

# ── 12. Pages & routing ─────────────────────────────────────────────
Commit-Files "feat(front): add root layout and metadata" @("front/app/layout.tsx")
Commit-Files "feat(front): add landing page" @("front/app/page.tsx")
Commit-Files "feat(front): add Wallbit connect page" @("front/app/connect/page.tsx")
Commit-Files "feat(front): add authenticated app layout" @("front/app/(app)/layout.tsx")
Commit-Files "feat(front): add pulse dashboard page" @("front/app/(app)/dashboard/page.tsx")
Commit-Files "feat(front): add forecast simulation page" @("front/app/(app)/forecast/page.tsx")
Commit-Files "feat(front): add investment radar page" @("front/app/(app)/radar/page.tsx")
Commit-Files "feat(front): add alerts management page" @("front/app/(app)/alerts/page.tsx")
Commit-Files "feat(front): add Telegram integration page" @("front/app/(app)/telegram/page.tsx")
Commit-Files "feat(front): add risk alert report page" @("front/app/report/risk-alert/[id]/page.tsx")

# ── 13. Catch remaining untracked files ─────────────────────────────
$remaining = git status --porcelain | Where-Object { $_ -match '^\?\?' } | ForEach-Object { ($_ -split '\s+', 2)[1].Trim('"') }
foreach ($file in $remaining) {
    if ($file -and (Test-Path -LiteralPath $file)) {
        Commit-Files "chore: add remaining project file $file" @($file)
    }
}

$count = (git rev-list --count HEAD)
Write-Host ""
Write-Host "Done. Total commits: $count"
