// App.jsx: central router — all 7 screens connected via React Router v6, wrapped in SessionProvider
import { Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import OnboardingScreen from "./screens/OnboardingScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import BrainDumpScreen from "./screens/BrainDumpScreen";
import SortedThoughtsScreen from "./screens/SortedThoughtsScreen";
import CompletionScreen from "./screens/CompletionScreen";
import SessionHistoryScreen from "./screens/SessionHistoryScreen";

export default function App() {
  return (
    <SessionProvider>
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