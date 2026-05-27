# Auth helper — verifies Supabase JWT from the Authorization header
from fastapi import HTTPException, Request
from .supabase_client import get_supabase


async def verify_user(request: Request) -> str:
    """
    Extract and verify the Supabase auth token from the Authorization header.
    Returns the authenticated user's ID.
    Raises 401 if the token is missing or invalid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header.split(" ", 1)[1]

    try:
        supabase = get_supabase()
        user_response = supabase.auth.get_user(token)
        if user_response.user is None:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return user_response.user.id
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication failed")