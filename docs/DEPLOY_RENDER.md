# Despliegue en Render — Wallbit Pulse

Blueprint IaC: [`render.yaml`](../render.yaml)  
Repositorio: [andrew-apps/wallbit-pulse](https://github.com/andrew-apps/wallbit-pulse)

## Servicios creados

| Nombre | Tipo | Carpeta | URL ejemplo |
|--------|------|---------|-------------|
| `wallbit-pulse-api` | Web (Python 3.11) | `backend/` | `https://wallbit-pulse-api.onrender.com` |
| `wallbit-pulse-web` | Web (Node 20) | `front/` | `https://wallbit-pulse-web.onrender.com` |

Grupo de secretos: **`wallbit-pulse-secrets`**

## Variables que debes completar en Render

Al aplicar el Blueprint, Render te pedirá:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `WALLBIT_API_KEY` | Sí | API Key Wallbit (`read`) |
| `TELEGRAM_BOT_TOKEN` | No | Bot @wallbit_radar_bot |
| `TELEGRAM_CHAT_ID` | No | Chat vinculado |
| `CEREBRAS_API_KEY` | No | Explicaciones IA en forecast |

Generadas automáticamente: `ENCRYPTION_KEY`, `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`.

## Desplegar (Dashboard — recomendado)

1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
2. Conecta GitHub → repo **`andrew-apps/wallbit-pulse`**
3. Branch: **`main`**
4. Blueprint name: **`wallbit-pulse`**
5. Revisa los 2 servicios + grupo `wallbit-pulse-secrets`
6. Completa secretos → **Deploy Blueprint**

## Desplegar (Cursor + Render MCP)

1. Crea API Key: [Account Settings → API Keys](https://dashboard.render.com/u/settings#api-keys)
2. En Windows (PowerShell):

```powershell
[System.Environment]::SetEnvironmentVariable("RENDER_API_KEY", "rnd_tu_key", "User")
```

3. Reinicia Cursor. En el chat:

```
Set my Render workspace to [TU_WORKSPACE]
List my Render services
```

4. El MCP **no aplica Blueprints** directamente; usa el Dashboard para el primer deploy. Después el MCP sirve para logs, métricas y env vars.

## Script local

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-render.ps1
```

Abre el asistente de Blueprint y valida `render.yaml` si tienes Render CLI.

## Post-deploy

1. Abre `https://wallbit-pulse-web.onrender.com/connect`
2. Conecta tu API Key Wallbit (o usa la del grupo si ya la pusiste)
3. Prueba `/forecast?symbol=GE` y `/dashboard`

## Notas técnicas

- **`TELEGRAM_USE_POLLING=false`** en producción (evita conflictos 409 en Render).
- **SQLite** en `backend/data/` — en plan free los datos pueden perderse al redeploy; para persistencia usa plan **Starter** + disco en `render.yaml`.
- **Playwright** (screenshots Telegram) no corre en free; el resto de la API sí.
- **CORS**: `FRONTEND_URL` se enlaza solo al dominio de `wallbit-pulse-web`.

## Health checks

- API: `GET /` → `{ "status": "ok" }`
- API docs: `/docs`
- Web: `/`
