import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./auth.module.css";

type Role = "patient" | "doctor";

export default function LoginPage() {
  const [role, setRole] = useState<Role>("patient");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "patient") {
      // In a real app, you'd verify credentials and fetch user data here.
    }
    if (role === "doctor") {
      navigate("/patients");
    }
  };

  return (
    <div className={styles.container}>
      {/* Role Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${role === "patient" ? styles.tabActive : ""}`}
          onClick={() => setRole("patient")}
        >
          Patient
        </button>
        <button
          className={`${styles.tab} ${role === "doctor" ? styles.tabActive : ""}`}
          onClick={() => setRole("doctor")}
        >
          Doctor
        </button>
      </div>

      <h2 className={styles.heading}>Welcome Back</h2>
      <p className={styles.subheading}>Sign in to your account to continue.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Email */}
        <div className={styles.inputWrapper}>
          <svg
            className={styles.inputIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="2,4 12,13 22,4" />
          </svg>
          <input
            className={styles.input}
            type="email"
            placeholder="Email Address"
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className={styles.inputWrapper}>
          <svg
            className={styles.inputIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            autoComplete="current-password"
          />
        </div>

        <div className={styles.forgotWrapper}>
          <a href="#" className={styles.forgotLink}>
            Forgot password?
          </a>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Sign In
        </button>
      </form>

      <p className={styles.footer}>
        Don't have an account?{" "}
        <Link to="/register" className={styles.link}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}
