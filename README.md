# ContextSwitch

A mobile-first bedtime cognitive offloading app. Dump your racing thoughts before sleep, let the app sort them into buckets, and reach a clear completion state — so your brain can rest.

## Tech Stack

- **Frontend:** React 19, Vite, CSS Modules
- **Routing:** React Router v7
- **Backend:** Python (FastAPI) serverless functions
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Deployment:** Vercel (frontend + Python API routes)
- **Drag & Drop:** @hello-pangea/dnd

## App Screens

| # | Screen | Description |
|---|--------|-------------|
| 1 | Onboarding | Welcome splash with tagline |
| 2 | Sign In | Email/password + Google OAuth |
| 3 | Sign Up | Email/password registration |
| 4 | Brain Dump | Large textarea with live thought counter |
| 5 | Sorted Thoughts | Thoughts auto-categorised into Tomorrow / Later / Not Your Problem Tonight |
| 6 | Completion | Reassurance screen, auto-saves session |
| 7 | Session History | Past sessions with expandable buckets + sign out |

## Project Structure

```
src/
├── App.jsx                    # Central router with protected routes
├── main.jsx                   # Entry point
├── index.css                  # Global styles
├── context/
│   └── SessionContext.jsx     # Shared auth + session state
├── lib/
│   └── supabase.js            # Supabase client init
├── screens/                   # One component + CSS module per screen
│   ├── OnboardingScreen.jsx
│   ├── SignInScreen.jsx
│   ├── SignUpScreen.jsx
│   ├── BrainDumpScreen.jsx
│   ├── SortedThoughtsScreen.jsx
│   ├── CompletionScreen.jsx
│   └── SessionHistoryScreen.jsx
└── utils/
    └── categorizeThoughts.js  # Keyword-based thought sorting logic

api/
├── app.py                     # Local dev server (combines endpoints)
├── _lib/
│   ├── auth.py                # Supabase token verification
│   └── supabase_client.py     # Supabase admin client init
└── sessions/
    ├── save.py                # POST /api/sessions/save
    └── list.py                # GET /api/sessions/list
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials.

| Variable | Used By | Description |
|----------|---------|-------------|
| `SUPABASE_URL` | Backend (Python) | Supabase project URL |
| `SUPABASE_ANON_KEY` | Backend (Python) | Supabase anonymous/public key |
| `SUPABASE_SERVICE_KEY` | Backend (Python) | Supabase service role key (for auth verification) |
| `VITE_SUPABASE_URL` | Frontend (Vite) | Same Supabase URL, exposed to the browser |
| `VITE_SUPABASE_ANON_KEY` | Frontend (Vite) | Same anon key, exposed to the browser |

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Supabase project with a `sessions` table

### Setup

```bash
# Install frontend dependencies
npm install

# Create and activate Python virtual environment
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Run

```bash
# Start both frontend and backend
npm run dev:all
```

This starts:
- **Vite dev server** on `http://localhost:5173`
- **Python API server** on `http://localhost:8000`

Vite proxies `/api/*` requests to the Python server automatically.

### Individual Commands

```bash
npm run dev          # Frontend only (Vite)
npm run dev:api      # Backend only (uvicorn)
npm run build        # Production build
```

## Supabase Database

The app expects a `sessions` table with the following columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `user_id` | uuid | References auth.users |
| `created_at` | timestamptz | Auto-set on insert |
| `brain_dump_text` | text | Raw brain dump input |
| `bucket_tomorrow` | jsonb | Array of thought strings |
| `bucket_later` | jsonb | Array of thought strings |
| `bucket_not_your_problem` | jsonb | Array of thought strings |

## Deployment

The app is deployed on Vercel. The Python API endpoints run as serverless functions using Mangum. No additional configuration is needed beyond setting environment variables in the Vercel dashboard.

## License

MIT