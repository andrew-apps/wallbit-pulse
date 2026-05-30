# Historial de Git — Wallbit Pulse AI

Este repositorio usa **Conventional Commits** y un historial atomico (~100 commits) que refleja el orden natural de construccion del MVP.

## Convencion de mensajes

| Prefijo | Uso |
|---------|-----|
| `chore` | Configuracion, dependencias, assets estaticos |
| `docs` | Documentacion de producto y guias |
| `feat` | Funcionalidad nueva (backend o frontend) |
| `style` | Estilos CSS y tokens visuales |

Formato: `tipo(alcance): descripcion breve en imperativo`

Ejemplos:

- `feat(backend): add Monte Carlo forecast engine`
- `feat(front): add pulse dashboard page`
- `docs: add README with setup and demo flow`

## Estructura del historial (~109 commits)

### 1. Fundacion (3)
- `.gitignore`, `README.md`, blueprint de producto

### 2. Backend — nucleo (6)
- Dependencias, plantilla `.env.example`, config, base de datos, entrypoint FastAPI

### 3. Backend — modelos (8)
- Un commit por entidad de dominio (`user`, `alert`, `trade`, etc.)

### 4. Backend — ML (4)
- Features, Monte Carlo, scoring de inversion

### 5. Backend — servicios (12)
- Cliente Wallbit, seguridad, forecast, alertas, Telegram, Playwright, etc.

### 6. Backend — rutas API (9)
- Un endpoint por commit (`connect`, `dashboard`, `forecast`, `reports`, ...)

### 7. Frontend — toolchain (7)
- `package.json`, TypeScript, Next.js, ESLint, Tailwind, shadcn

### 8. Frontend — lib y hooks (7)
- Tipos, API client, formatters, hooks compartidos

### 9. Frontend — UI primitivos (9 batches)
- Componentes shadcn/ui agrupados por familia (formularios, dialogs, navegacion, ...)

### 10. Frontend — dominio (22)
- Cards de Pulse, forecast, Telegram, trades, dashboard charts

### 11. Estilos y assets (~10)
- CSS global, iconos PNG/SVG, placeholders

### 12. Paginas y rutas (10)
- Landing, connect, layout autenticado, dashboard, forecast, radar, alertas, Telegram, reporte HTML

### 13. Utilidades (1)
- Script `scripts/git-history-bootstrap.ps1` para regenerar el historial

## Archivos excluidos del versionado

Ver `.gitignore` en la raiz. Nunca commitear:

- `.env` / `backend/.env` (tokens y claves)
- `backend/*.db` (SQLite local)
- `front/node_modules/`, `front/.next/`
- Logs (`*.log`)

## Regenerar el historial desde cero

Solo en repositorios locales sin remoto compartido:

```powershell
Remove-Item -Recurse -Force .git
git init -b main
powershell -ExecutionPolicy Bypass -File scripts/git-history-bootstrap.ps1
```

## Buenas practicas aplicadas

1. **Commits atomicos**: cada commit introduce un cambio coherente y revisable.
2. **Orden de dependencias**: modelos antes que servicios, servicios antes que rutas, lib antes que paginas.
3. **Sin secretos**: variables sensibles solo en `.env.example` como plantilla vacia.
4. **Trazabilidad**: el historial cuenta la historia del producto capa por capa.
