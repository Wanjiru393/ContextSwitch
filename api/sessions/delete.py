# DELETE /api/sessions/delete — delete a session owned by the authenticated user
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from mangum import Mangum
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from _lib import verify_user, get_supabase

app = FastAPI()


class DeleteSessionRequest(BaseModel):
    session_id: str


@app.delete("/api/sessions/delete")
async def delete_session(body: DeleteSessionRequest, request: Request):
    user_id = await verify_user(request)

    supabase = get_supabase()
    result = (
        supabase.table("sessions")
        .delete()
        .eq("id", body.session_id)
        .eq("user_id", user_id)
        .execute()
    )

    return {"status": "ok"}


handler = Mangum(app)