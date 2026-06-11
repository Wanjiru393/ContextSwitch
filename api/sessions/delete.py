# api/sessions/delete.py - Delete a session owned by the authenticated user
import json
import os
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def handler(request, response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"

    if request.method == "OPTIONS":
        response.status_code = 204
        return ""

    if request.method != "DELETE":
        response.status_code = 405
        return json.dumps({"error": "Method not allowed"})

    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        response.status_code = 401
        return json.dumps({"error": "Missing authorization token"})

    token = auth_header.replace("Bearer ", "")

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user
        if not user:
            response.status_code = 401
            return json.dumps({"error": "Invalid token"})
    except Exception:
        response.status_code = 401
        return json.dumps({"error": "Invalid token"})

    try:
        body = json.loads(request.body)
        session_id = body.get("session_id")
    except Exception:
        response.status_code = 400
        return json.dumps({"error": "Missing session_id"})

    if not session_id:
        response.status_code = 400
        return json.dumps({"error": "Missing session_id"})

    try:
        supabase.table("sessions").delete().eq("id", session_id).eq("user_id", user.id).execute()
        response.status_code = 200
        return json.dumps({"success": True})
    except Exception as e:
        response.status_code = 500
        return json.dumps({"error": str(e)})