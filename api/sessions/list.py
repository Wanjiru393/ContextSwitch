# GET /api/sessions/list — retrieve all past sessions for the authenticated user
from fastapi import FastAPI, HTTPException, Request
from mangum import Mangum
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _lib import verify_user, get_supabase

app = FastAPI()


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


handler = Mangum(app)