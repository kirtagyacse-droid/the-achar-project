"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        router.push(redirectUrl);
      } else {
        setError(data.error || 'Invalid password');
        setLoading(false);
      }
    } catch {
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>🫙</div>
          <h1 style={styles.title}>RS Savoury</h1>
          <p style={styles.subtitle}>Jaipur Artisanal Homemade Achar</p>
        </div>

        <h2 style={styles.adminTitle}>Admin Portal</h2>
        
        {error && <div style={styles.errorAlert}>{error}</div>}
        
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Enter Admin Password
            </label>
            <input 
              id="password"
              type="password" 
              style={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            style={loading ? { ...styles.submitBtn, ...styles.submitBtnDisabled } : styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loadingSpinnerContainer}>
                <span style={styles.spinner} />
                <span>Authenticating...</span>
              </span>
            ) : (
              'Authorize Access'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div style={styles.loadingFallback}>
        <div style={styles.spinnerLarge} />
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}

// Inlined CSS styles for guaranteed premium visuals without external dependency issues
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 120px)',
    backgroundColor: '#FAF6F0', // Warm cream background
    padding: '40px 20px',
    fontFamily: '"Outfit", "Inter", -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(154, 44, 44, 0.12)', // Subtle Maroon border
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(92, 6, 6, 0.05), 0 2px 4px rgba(0, 0, 0, 0.02)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoBadge: {
    fontSize: '2.5rem',
    marginBottom: '12px',
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#5C0606', // Deep Maroon
    margin: '0 0 4px 0',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#8B6A60', // Dusty rose brown
    margin: 0,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  },
  adminTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    margin: '0 0 24px 0',
  },
  errorAlert: {
    backgroundColor: '#FFF2F2',
    border: '1px solid #FFD2D2',
    color: '#9A2C2C',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '0.9rem',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '24px',
  },
  label: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: '8px',
  },
  input: {
    minHeight: '48px',
    padding: '0 16px',
    borderRadius: '8px',
    border: '1px solid #D9D9D9',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
    backgroundColor: '#FCFCFC',
  },
  submitBtn: {
    minHeight: '48px',
    backgroundColor: '#9A2C2C', // Signature Maroon
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(154, 44, 44, 0.15)',
  },
  submitBtnDisabled: {
    backgroundColor: '#D1A3A3',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  loadingSpinnerContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #FFFFFF',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
  loadingFallback: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    backgroundColor: '#FAF6F0',
  },
  spinnerLarge: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(154, 44, 44, 0.1)',
    borderTop: '3px solid #9A2C2C',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }
};
