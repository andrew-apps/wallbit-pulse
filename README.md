# Wallbit Pulse AI

MVP para el Wallbit API Challenge: web app minimalista + backend FastAPI + agente Telegram demo. La experiencia se centra en cuatro decisiones: pulso del portafolio, riesgo de hoy, forecast de inversion y alerta visual por Telegram.

## Entregables

- Blueprint de producto, arquitectura, modelo de datos, roadmap, pantallas, pseudocodigo y pitch: [docs/WALLBIT_PULSE_AI_BLUEPRINT.md](docs/WALLBIT_PULSE_AI_BLUEPRINT.md)
- Frontend Next.js en [front](front)
- Backend FastAPI en [backend](backend)
- Forecast Monte Carlo y scoring en [backend/app/ml](backend/app/ml)
- Risk Snapshot HTML en frontend: `/report/risk-alert/risk-nvda-5`
- Risk Snapshot HTML backend: `GET /report/risk-alert/{alert_id}`
- Screenshot Playwright + envio Telegram: `POST /reports/{alert_id}/send-telegram`
- Bot Telegram [@wallbit_radar_bot](https://t.me/wallbit_radar_bot): guia en [docs/TELEGRAM_BOT.md](docs/TELEGRAM_BOT.md)

## Correr frontend

```bash
cd front
cp .env.local.example .env.local
pnpm install
pnpm dev
```

Abrir `http://localhost:3000`.

Comandos de calidad:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

## Correr backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m playwright install chromium
uvicorn app.main:app --reload --port 8000
```

Con bot Telegram y polling automatico:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-with-telegram.ps1
```

Backend: `http://localhost:8000`  
Swagger: `http://localhost:8000/docs`

## Variables de entorno

Copiar `backend/.env.example` a `backend/.env` o sincronizar desde la raiz:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-telegram-env.ps1
```

```env
WALLBIT_BASE_URL=https://api.wallbit.io
WALLBIT_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_BOT_USERNAME=wallbit_radar_bot
TELEGRAM_USE_POLLING=true
FRONTEND_URL=http://localhost:3000
ENCRYPTION_KEY=change-this-local-secret
```

Frontend (`front/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Si no configuras Wallbit o Telegram, el MVP usa modo demo y no envia dinero ni mensajes reales.

### Conectar cuenta Wallbit real

1. Crea una API Key en **Wallbit → Settings → API Keys** con permiso **`read`**.
2. Asegurate de tener el backend en `:8000` y `front/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:8000`.
3. En `/connect` pega la key y pulsa **Validar conexion**.
4. El backend valida contra `GET /api/public/v1/balance/checking`, cifra la key y la guarda en SQLite.
5. El dashboard (`/dashboard`) mostrara balances reales de tu cuenta.

Errores comunes:

| Mensaje | Solucion |
|---------|----------|
| API Key invalida | Copia la key completa desde Wallbit |
| Sin permiso `read` | Crea una key nueva con lectura |
| Backend no configurado | Crea `front/.env.local` y reinicia `pnpm dev` |
| Error de red | Verifica internet y que `api.wallbit.io` responda |

## Demo en menos de 2 minutos

1. Abrir landing.
2. Conectar Wallbit en modo demo.
3. Vincular Telegram: abrir `/telegram`, enviar `/start WB-PULSE-XXXX` a [@wallbit_radar_bot](https://t.me/wallbit_radar_bot).
4. Ver Pulse con cuatro cards.
5. Abrir Forecast y simular BTC, USD 500, 30 dias.
6. Presionar Enviar a Telegram.
7. Abrir Alertas y crear: "Cuando NVDA caiga mas de 5%, enviar Telegram".
8. Abrir `/report/risk-alert/risk-nvda-5`.
9. Mostrar Telegram Preview y comando `/rebalancear`.
10. Abrir modal de orden y cancelar para demostrar seguridad.

## Seguridad del MVP

- Modo read-only por defecto.
- API keys cifradas antes de persistir o auditar.
- API key nunca se devuelve ni se imprime completa.
- Trades requieren audit log previo, permiso trade, no read-only, limite seguro y texto `CONFIRMAR`.
- Todas las recomendaciones incluyen disclaimer.
- No se usa lenguaje de ganancia garantizada.
