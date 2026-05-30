# Despliegue en Render

Este monorepo incluye un [Render Blueprint](https://render.com/docs/blueprint-spec) en `render.yaml`.

## Servicios

| Servicio | Carpeta | Runtime | Puerto |
|----------|---------|---------|--------|
| `wallbit-pulse-api` | `backend/` | Python 3.11 + FastAPI | `$PORT` |
| `wallbit-pulse-web` | `front/` | Node 20 + Next.js | `$PORT` |

## Desplegar

1. Sube el repo a GitHub (`andrew-apps/wallbit-pulse`).
2. En [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
3. Conecta el repositorio; Render detectará `render.yaml`.
4. Completa las variables marcadas como secretas:
   - `WALLBIT_API_KEY`
   - `TELEGRAM_BOT_TOKEN` (opcional)
   - `CEREBRAS_API_KEY` (opcional, explicaciones IA)
5. Aplica el Blueprint. Render creará API + frontend y enlazará `NEXT_PUBLIC_API_URL` automáticamente.

## Persistencia

La API usa SQLite en un disco Render (`backend/data/`). Sin disco, los datos se pierden en cada redeploy.

## Health check

- API: `GET /`
- Swagger: `GET /docs`

## Notas

- El plan free puede dormir servicios tras inactividad.
- Playwright (screenshots Telegram) no está habilitado en Render free; el resto de la API funciona.
- Tras el deploy, conecta Wallbit desde `/connect` en la URL del frontend.
