# Despliegue en Render — Wallbit Pulse (plan FREE)

Blueprint: [`render.yaml`](../render.yaml)  
Repo: [andrew-apps/wallbit-pulse](https://github.com/andrew-apps/wallbit-pulse)

## Servicios (plan free)

| Servicio | Plan | RAM aprox. |
|----------|------|------------|
| `wallbit-pulse-api` | **free** | 512 MB |
| `wallbit-pulse-web` | **free** | 512 MB |

Ambos en región **Oregon**. Sin disco persistente (no disponible en free).

## Limitaciones del plan free (importante)

| Tema | Comportamiento |
|------|----------------|
| **Cold start** | Tras ~15 min sin tráfico, el servicio duerme. La primera petición puede tardar **30–90 s**. |
| **Horas** | 750 h/mes compartidas entre todos tus servicios free del workspace. |
| **SQLite** | Base de datos **efímera**: se reinicia en cada redeploy. Conexiones Wallbit se pierden → vuelve a `/connect`. |
| **Playwright** | **No incluido** en Render (`requirements-render.txt`). Screenshots Telegram deshabilitados; el resto funciona. |
| **Telegram polling** | **Desactivado** (`TELEGRAM_USE_POLLING=false`). El bot no escucha en background en free. |
| **Builds** | Menos dependencias = build más rápido y menos riesgo de quedarte sin minutos. |

## Qué sí funciona en free

- Dashboard, radar, forecast (Yahoo + Monte Carlo)
- Conexión Wallbit vía `/connect`
- Cerebras IA (si pones `CEREBRAS_API_KEY`)
- Track record (hasta el próximo redeploy)
- Alertas guardadas en SQLite (efímero)

## Secretos al desplegar

Grupo **`wallbit-pulse-secrets`**:

| Variable | ¿Obligatoria? |
|----------|----------------|
| `WALLBIT_API_KEY` | Sí (recomendado en env group para que la API arranque con datos) |
| `CEREBRAS_API_KEY` | No |
| `TELEGRAM_BOT_TOKEN` | No |
| `TELEGRAM_CHAT_ID` | No |

Auto-generadas: `ENCRYPTION_KEY`, `NEXT_PUBLIC_API_URL`, `FRONTEND_URL`.

## Desplegar

1. [Render → New Blueprint](https://dashboard.render.com/blueprint/new)
2. Repo **`andrew-apps/wallbit-pulse`**, branch **`main`**
3. Nombre: **`wallbit-pulse`**
4. Verifica que ambos servicios muestren **Plan: Free**
5. Completa secretos → **Deploy Blueprint**

```powershell
powershell -ExecutionPolicy Bypass -File scripts/deploy-render.ps1
```

## Post-deploy

1. Espera el primer deploy (API ~3–5 min en free)
2. Abre `https://wallbit-pulse-web.onrender.com/connect`
3. Conecta Wallbit (necesario si SQLite se reinició)
4. Prueba `/forecast?symbol=GE`

## Si necesitas persistencia real

Pasa **`wallbit-pulse-api`** a plan **Starter** (~7 USD/mes) y añade disco en `render.yaml`. No es necesario para demo/hackathon.

## Health checks

- API: `GET /`
- Docs: `/docs`
