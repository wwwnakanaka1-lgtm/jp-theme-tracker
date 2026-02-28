# HANDOFF

Created: 2026-02-01
Updated: 2026-02-28

## Project Status
JP Theme Tracker — Full-stack Japanese stock theme tracker.
- **Backend**: FastAPI (Python) + APScheduler for 5-min background data updates
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, SWR, Recharts
- **Data**: yfinance → precomputed JSON files (no DB)
- **Architecture**: Monorepo (`backend/` + `frontend/`)

## Recent Changes (2026-02-28 maintenance)
- Committed spec-drift-guard traceability markers (`req:REQ-XXX`) across all source files
- Dynamic port policy fully applied to all bat scripts
- Added `backend/pyproject.toml` with ruff linting + pytest config
- Updated `.gitignore` for generated artifacts (.sdg/, reports/, SPEC_*.html)

## Key Architecture Decisions
- Precomputed JSON for fast API responses (no DB, APScheduler refreshes every 5 min)
- Dynamic port allocation: backend auto-detects available port, writes to `port_config.json`
- PWA enabled via next-pwa
- 20 themes x 10 stocks = 200 stocks tracked

## Known Issues
- No test coverage (zero test files)
- No ESLint configuration for frontend
- No README.md at project root

## File Structure
- `backend/main.py` — FastAPI entry point with lifespan/scheduler
- `backend/routers/` — API routes (themes.py, stocks.py)
- `backend/services/` — Business logic (calculator.py, data_fetcher.py)
- `backend/data/themes.py` — Theme definitions (20 themes, static data)
- `backend/jobs/update_data.py` — Background data update job
- `frontend/app/` — Next.js App Router pages (5 routes)
- `frontend/components/` — React components (12 files)
- `frontend/lib/api.ts` — API client with SWR
