import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './auth.module.css';

type Role = 'patient' | 'doctor';

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('patient');
  const [agreed, setAgreed] = useState(false);

  return (
    <div className={styles.container}>
      {/* Role Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${role === 'patient' ? styles.tabActive : ''}`}
          onClick={() => setRole('patient')}
        >
          Patient
        </button>
        <button
          className={`${styles.tab} ${role === 'doctor' ? styles.tabActive : ''}`}
          onClick={() => setRole('doctor')}
        >
          Doctor
        </button>
      </div>

      <h2 className={styles.heading}>Create Account</h2>
      <p className={styles.subheading}>Start your unified health journey.</p>

      <form className={styles.form} onSubmit={e => e.preventDefault()}>
        {/* Full Name */}
        <div className={styles.inputWrapper}>
          <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <input className={styles.input} type="text" placeholder="Full Name" autoComplete="name" />
        </div>

        {/* ID Number */}
        <div className={styles.inputWrapper}>
          <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          <input className={styles.input} type="text" placeholder="ID Number (Teudat Zehut)" autoComplete="off" />
        </div>

        {/* Email */}
        <div className={styles.inputWrapper}>
          <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <polyline points="2,4 12,13 22,4"/>
          </svg>
          <input className={styles.input} type="email" placeholder="Email Address" autoComplete="email" />
        </div>

        {/* Password */}
        <div className={styles.inputWrapper}>
          <svg className={styles.inputIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <input className={styles.input} type="password" placeholder="Password" autoComplete="new-password" />
        </div>

        {/* Terms */}
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>
            I agree to the{' '}
            <a href="#" className={styles.link}>Terms</a>
            {' '}and{' '}
            <a href="#" className={styles.link}>Privacy Policy</a>
          </span>
        </label>

        <button type="submit" className={styles.submitBtn}>
          Create Account
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>Sign In</Link>
      </p>
    </div>
  );
}
