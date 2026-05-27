# Async Supabase client — reads credentials from environment variables only
import os
from supabase import create_client, Client

_supabase: Client | None = None


def get_supabase() -> Client:
    """Return a cached Supabase client using the service role key."""
    global _supabase
    if _supabase is None:
        url = os.environ["SUPABASE_URL"]
        key = os.environ["SUPABASE_SERVICE_KEY"]
        _supabase = create_client(url, key)
    return _supabase


def get_supabase_anon() -> Client:
    """Return a Supabase client using the anon key (for auth verification)."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_ANON_KEY"]
    return create_client(url, key)