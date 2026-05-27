// OnboardingScreen: first screen users see — sparkles, illustration, tagline, CTA
import { useNavigate } from "react-router-dom";
import illustration from "../assets/onboard.png";
import styles from "./OnboardingScreen.module.css";

export default function OnboardingScreen() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      {/* Soft rounded 4-point diamond sparkles */}
      <div className={styles.sparkles}>
        <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 2 C34 14, 38 22, 42 26 C46 30, 54 32, 62 32 C54 32, 46 34, 42 38 C38 42, 34 50, 32 62 C30 50, 26 42, 22 38 C18 34, 10 32, 2 32 C10 32, 18 30, 22 26 C26 22, 30 14, 32 2 Z"
            fill="#7C3AED"
          />
        </svg>
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none" className={styles.sparkleSmall}>
          <path
            d="M32 2 C34 14, 38 22, 42 26 C46 30, 54 32, 62 32 C54 32, 46 34, 42 38 C38 42, 34 50, 32 62 C30 50, 26 42, 22 38 C18 34, 10 32, 2 32 C10 32, 18 30, 22 26 C26 22, 30 14, 32 2 Z"
            fill="#7C3AED"
            opacity="0.5"
          />
        </svg>
      </div>

      <h1 className={styles.heading}>ContextSwitch</h1>
      <p className={styles.tagline}>Clear your mind, Sleep well.</p>

      <img
        className={styles.illustration}
        src={illustration}
        alt="Chaotic thoughts becoming organised"
      />

      <button className={styles.button} onClick={() => navigate("/signin")}>
        Get Started
      </button>
    </div>
  );
}