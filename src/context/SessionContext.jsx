// SessionContext: provides brain dump text and session reset across all screens
import { createContext, useContext, useState } from "react";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [brainDumpText, setBrainDumpText] = useState("");

  const resetSession = () => setBrainDumpText("");

  return (
    <SessionContext.Provider value={{ brainDumpText, setBrainDumpText, resetSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}