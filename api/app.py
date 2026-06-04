# Local development server — combines both API endpoints into one runnable FastAPI app
# Run with: uvicorn api.app:app --reload --port 8000
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys, os

# Load .env from project root
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Ensure _lib is importable
sys.path.insert(0, os.path.dirname(__file__))
from _lib import verify_user, get_supabase

app = FastAPI()

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Bucket(BaseModel):
    tomorrow: list[str]
    later: list[str]
    notYourProblem: list[str]


class SaveSessionRequest(BaseModel):
    brain_dump_text: str
    buckets: Bucket


@app.post("/api/sessions/save")
async def save_session(body: SaveSessionRequest, request: Request):
    user_id = await verify_user(request)
    supabase = get_supabase()
    result = supabase.table("sessions").insert({
        "user_id": user_id,
        "brain_dump_text": body.brain_dump_text,
        "bucket_tomorrow": body.buckets.tomorrow,
        "bucket_later": body.buckets.later,
        "bucket_not_your_problem": body.buckets.notYourProblem,
    }).execute()
    if result.data is None:
        raise HTTPException(status_code=500, detail="Failed to save session")
    return {"status": "ok", "session": result.data[0]}


@app.get("/api/sessions/list")
async def list_sessions(request: Request):
    user_id = await verify_user(request)
    supabase = get_supabase()
    result = (
        supabase.table("sessions")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return {"status": "ok", "sessions": result.data or []}