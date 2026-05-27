// BrainDumpScreen: main input screen — user dumps racing thoughts into a textarea
// Live counter shows "X thoughts captured" based on non-empty lines
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/SessionContext";
import styles from "./BrainDumpScreen.module.css";

export default function BrainDumpScreen() {
  const navigate = useNavigate();
  const { brainDumpText, setBrainDumpText } = useSession();

  // Count non-empty lines as individual thoughts
  const thoughtCount = brainDumpText
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

  const handleDone = () => {
    if (thoughtCount === 0) return;
    navigate("/sorted");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>What's in your head right now?</h1>
      <p className={styles.subtext}>Write everything. Don't filter it.</p>
      <textarea
        className={styles.textarea}
        placeholder="Dump every thought here, one per line..."
        value={brainDumpText}
        onChange={(e) => setBrainDumpText(e.target.value)}
      />
      <div className={styles.footer}>
        <p className={styles.counter}>
          {thoughtCount} thought{thoughtCount !== 1 ? "s" : ""} captured
        </p>
        <button className={styles.button} onClick={handleDone}>
          Done - Let's go !
        </button>
      </div>
    </div>
  );
}