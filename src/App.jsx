// App.jsx: central router — protected routes and auth handling via React Router v6
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

// Redirects to /signin if user is not authenticated
function ProtectedRoute({ children }) {
  const { user } = useSession();
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

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
        <Route path="/brain-dump" element={<ProtectedRoute><BrainDumpScreen /></ProtectedRoute>} />
        <Route path="/sorted" element={<ProtectedRoute><SortedThoughtsScreen /></ProtectedRoute>} />
        <Route path="/completion" element={<ProtectedRoute><CompletionScreen /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><SessionHistoryScreen /></ProtectedRoute>} />
        {/* Catch-all redirect to onboarding */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SessionProvider>
  );
}