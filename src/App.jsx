// App.jsx: central router — all 7 screens connected via React Router v6, wrapped in SessionProvider
import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SessionProvider, useSession } from "./context/SessionContext";
import { supabase } from "./lib/supabase";
import OnboardingScreen from "./screens/OnboardingScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import BrainDumpScreen from "./screens/BrainDumpScreen";
import SortedThoughtsScreen from "./screens/SortedThoughtsScreen";
import CompletionScreen from "./screens/CompletionScreen";
import SessionHistoryScreen from "./screens/SessionHistoryScreen";

// Listens for Supabase auth state changes (e.g. OAuth redirect callback)
// and stores user/session in context, then navigates to brain dump
function AuthBridge() {
  const navigate = useNavigate();
  const { setUser, setSession } = useSession();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setUser(session.user);
          setSession(session);
          navigate("/brain-dump");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, setUser, setSession]);

  return null;
}

export default function App() {
  return (
    <SessionProvider>
      <AuthBridge />
      <Routes>
        <Route path="/" element={<OnboardingScreen />} />
        <Route path="/signin" element={<SignInScreen />} />
        <Route path="/signup" element={<SignUpScreen />} />
        <Route path="/brain-dump" element={<BrainDumpScreen />} />
        <Route path="/sorted" element={<SortedThoughtsScreen />} />
        <Route path="/completion" element={<CompletionScreen />} />
        <Route path="/history" element={<SessionHistoryScreen />} />
        {/* Catch-all redirect to onboarding */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionProvider>
  );
}