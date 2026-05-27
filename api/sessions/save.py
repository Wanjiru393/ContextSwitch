# POST /api/sessions/save — save a completed brain dump session to Supabase
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from mangum import Mangum
import sys, os

# Add parent directory to path so _lib is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _lib import verify_user, get_supabase

app = FastAPI()


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


handler = Mangum(app)