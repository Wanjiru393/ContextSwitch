// SignInScreen: mock sign-in form with brand header, labels, eye toggle, and Google button
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignInScreen.module.css";

// Soft 4-point diamond sparkle for brand header
function SparkleIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
      <path
        d="M32 2 C34 14, 38 22, 42 26 C46 30, 54 32, 62 32 C54 32, 46 34, 42 38 C38 42, 34 50, 32 62 C30 50, 26 42, 22 38 C18 34, 10 32, 2 32 C10 32, 18 30, 22 26 C26 22, 30 14, 32 2 Z"
        fill="#7C3AED"
      />
    </svg>
  );
}

export default function SignInScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate("/brain-dump");
  };

  return (
    <div className={styles.container}>
      <div className={styles.brand}>
        <SparkleIcon />
        <span className={styles.brandName}>ContextSwitch</span>
      </div>

      <h1 className={styles.heading}>Welcome Back!</h1>

      <form className={styles.form} onSubmit={handleSignIn}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Email Address</label>
          <input className={styles.input} type="email" placeholder="Email" />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Password</label>
          <div className={styles.passwordWrapper}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
            />
            <button
              type="button"
              className={styles.eyeToggle}
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <span className={styles.forgotLink}>Forgot Password?</span>
        <button className={styles.button} type="submit">Sign in</button>
      </form>

      <button
        className={styles.googleButton}
        onClick={() => navigate("/brain-dump")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </button>

      <p className={styles.link}>
        Don't have an account?{" "}
        <span className={styles.linkText} onClick={() => navigate("/signup")}>
          Sign Up
        </span>
      </p>
    </div>
  );
}