// CompletionScreen: reassurance screen — auto-saves session to backend on load, shows save status
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import styles from "./CompletionScreen.module.css";

export default function CompletionScreen() {
  const navigate = useNavigate();
  const { brainDumpText, categorisedThoughts, session } = useSession();
  const [saveStatus, setSaveStatus] = useState("saving"); // "saving" | "saved" | "error"
  const hasSaved = useRef(false);

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    const saveSession = async () => {
      if (!session?.access_token || !categorisedThoughts) {
        setSaveStatus("error");
        return;
      }

      try {
        const res = await fetch("/api/sessions/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            brain_dump_text: brainDumpText,
            buckets: categorisedThoughts,
          }),
        });

        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    };

    saveSession();
  }, [brainDumpText, categorisedThoughts, session]);

  return (
    <div className={styles.container}>
      {/* Soft rounded 4-point green diamond sparkles */}
      <div className={styles.sparkles}>
        <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 2 C34 14, 38 22, 42 26 C46 30, 54 32, 62 32 C54 32, 46 34, 42 38 C38 42, 34 50, 32 62 C30 50, 26 42, 22 38 C18 34, 10 32, 2 32 C10 32, 18 30, 22 26 C26 22, 30 14, 32 2 Z"
            fill="#22C55E"
          />
        </svg>
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none" className={styles.sparkleSmall}>
          <path
            d="M32 2 C34 14, 38 22, 42 26 C46 30, 54 32, 62 32 C54 32, 46 34, 42 38 C38 42, 34 50, 32 62 C30 50, 26 42, 22 38 C18 34, 10 32, 2 32 C10 32, 18 30, 22 26 C26 22, 30 14, 32 2 Z"
            fill="#22C55E"
            opacity="0.45"
          />
        </svg>
      </div>

      <h1 className={styles.heading}>Your brain can rest now.</h1>
      <p className={styles.subtext}>
        These thoughts are safe here. Worry about today, tomorrow will handle
        itself.
      </p>
      <button className={styles.button} onClick={() => navigate("/history")}>
        DONE
      </button>
      <p className={styles.footer}>
        {saveStatus === "saving" && "Saving your thoughts..."}
        {saveStatus === "saved" && "Session saved · Sleep well"}
        {saveStatus === "error" && "Save failed — that's OK, sleep well"}
      </p>
    </div>
  );
}