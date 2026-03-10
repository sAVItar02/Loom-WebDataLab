## LOOM

Loom is an interactive web scraping + visualization playground. You give it a **URL** and **selector**, the backend fetches/extracts data (BeautifulSoup/Selenium) and persists it, and the frontend visualizes results.

## Repo structure

- **`backend/`**: FastAPI app (Python)
- **`frontend/`**: Vite + React + TypeScript (Node)

## Prerequisites

- **Node.js**: \(recommended\) **20.19+** (Vite 7 requires Node 20.19+ or 22.12+)
- **Python**: 3.11+ (on Windows, `py -V` should work)

## Quick start (Windows / PowerShell)

From the `Loom-WebDataLab/` folder:

```bash
npm install
cd frontend
npm install
cd ..\backend
py -m pip install -r requirements.txt
py -m pip install pydantic-settings selenium
```

Start the two dev servers in **separate terminals**:

```bash
# Terminal A (backend)
cd backend
py -m uvicorn app.main:app --reload --port 8000
```

```bash
# Terminal B (frontend)
cd frontend
npm run dev
```

- **Frontend**: `http://localhost:5173/`
- **Backend**: `http://127.0.0.1:8000/`
- **API docs (Swagger)**: `http://127.0.0.1:8000/docs`

## Configuration

### Backend environment variables

The backend reads environment variables from `backend/.env` (optional).

- **`DATABASE_URL`**:
  - Default: `sqlite:///./app.db` (local file in `backend/`)
  - Example Postgres: `postgresql://user:pass@host:5432/dbname`

If you want Postgres, create `backend/.env`:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Useful endpoints

- **Preview picker**: `GET /preview?url=<pageUrl>`
  - Example: `http://127.0.0.1:8000/preview/?url=https://example.com`

## Troubleshooting

- **Vite “requires Node 20.19+”**: upgrade Node (your app may start but this is unsupported).
- **Backend import errors (missing modules)**: ensure you installed Python deps from `backend/` using `py -m pip ...`.
- **Python package conflicts (Anaconda/global env)**: consider using an isolated venv:

```bash
cd backend
py -m venv .venv
.\.venv\Scripts\activate
py -m pip install -r requirements.txt
py -m pip install pydantic-settings selenium
py -m uvicorn app.main:app --reload --port 8000
```
