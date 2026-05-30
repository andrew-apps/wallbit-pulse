# Bot de Telegram — Wallbit Pulse AI

Bot oficial: [@wallbit_radar_bot](https://t.me/wallbit_radar_bot)

## Configuracion

1. Copia el token de BotFather a `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=tu_token
TELEGRAM_BOT_USERNAME=wallbit_radar_bot
TELEGRAM_USE_POLLING=true
FRONTEND_URL=http://localhost:3000
```

2. Sincroniza desde la raiz (si guardaste el token en `.env`):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-telegram-env.ps1
```

3. Frontend apuntando al backend:

```bash
cd front
cp .env.local.example .env.local
pnpm dev
```

4. Arranca backend con polling automatico:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-with-telegram.ps1
```

## Vinculacion de usuario

1. Abre `/telegram` en la web.
2. Copia el codigo `WB-PULSE-XXXX`.
3. En Telegram abre [@wallbit_radar_bot](https://t.me/wallbit_radar_bot).
4. Envia: `/start WB-PULSE-XXXX`
5. La web detecta la vinculacion y habilita envios reales.

Alternativa: define `TELEGRAM_CHAT_ID` manualmente en `backend/.env` si ya conoces tu chat id.

## Comandos del bot

| Comando | Descripcion |
|---------|-------------|
| `/start` | Bienvenida y ayuda |
| `/help` | Lista de comandos |
| `/resumen` | Pulso del portafolio demo |
| `/riesgo` | Exposicion principal NVDA |
| `/forecast BTC 500 30` | Simulacion Monte Carlo |
| `/ranking` | Top 5 oportunidades |
| `/rebalancear` | Sugerencia de ajuste |
| `/alertas` | Alertas activas |

## Endpoints API

| Metodo | Ruta | Uso |
|--------|------|-----|
| GET | `/telegram/status` | Estado del bot y vinculacion |
| POST | `/telegram/link-code` | Genera codigo WB-PULSE |
| POST | `/telegram/webhook` | Webhook (produccion) |
| POST | `/telegram/send-forecast` | Envia forecast al chat vinculado |
| POST | `/reports/{alert_id}/send-telegram` | Screenshot + foto en Telegram |

## Modos de recepcion

- **Local (MVP):** `TELEGRAM_USE_POLLING=true` — el backend escucha updates con long polling al iniciar.
- **Produccion:** `TELEGRAM_USE_POLLING=false` + webhook HTTPS en `POST /telegram/webhook`.

## Demo rapida

1. Vincula Telegram desde la web.
2. En Forecast pulsa **Enviar a Telegram**.
3. Crea alerta NVDA y llama `POST /reports/risk-nvda-5/send-telegram`.
4. En el bot prueba `/rebalancear`.
