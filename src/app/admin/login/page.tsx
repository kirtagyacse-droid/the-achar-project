"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminLoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShake(false);
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1200);
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setError(data.error || 'Invalid password');
        setLoading(false);
      }
    } catch {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container} className="card-entrance">
        <div style={{ ...styles.card, borderColor: '#166534', boxShadow: '0 12px 30px rgba(22, 101, 52, 0.1)' }}>
          <div style={{ textAlign: 'center', padding: '24px 0' }} className="success-pop-anim">
            <div style={{ fontSize: '4.5rem', marginBottom: '20px' }} className="lock-unlock-anim">🔓</div>
            <h2 style={{ fontFamily: 'Georgia, serif', color: '#166534', fontSize: '1.8rem', fontWeight: '700', margin: '0 0 8px 0' }}>
              Access Granted
            </h2>
            <p style={{ color: '#166534', fontWeight: '700', fontSize: '0.8rem', margin: '0 0 24px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Welcome, Admin
            </p>
            <div style={{ 
              margin: '0 auto', 
              width: '28px', 
              height: '28px', 
              border: '3px solid rgba(22, 101, 52, 0.2)', 
              borderTopColor: '#166534', 
              borderRadius: '50%', 
              animation: 'spin 0.8s linear infinite' 
            }} />
            <p style={{ color: '#71717A', fontSize: '0.82rem', marginTop: '16px', fontWeight: '500' }}>
              Redirecting to dashboard...
            </p>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            @keyframes successPop {
              0% { transform: scale(0.6); opacity: 0; }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes lockUnlock {
              0% { transform: translateY(0) scale(1); }
              50% { transform: translateY(-10px) scale(1.05); }
              100% { transform: translateY(0) scale(1); }
            }
            .success-pop-anim {
              animation: successPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .lock-unlock-anim {
              animation: lockUnlock 1s ease-in-out infinite;
            }
            .card-entrance {
              animation: cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes cardEntrance {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="card-entrance">
      <div style={styles.card} className={shake ? 'shake-anim' : ''}>
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
                <span className="button-spinner" />
                <span>Authenticating...</span>
              </span>
            ) : (
              'Authorize Access'
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-entrance {
          animation: cardEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .shake-anim {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          border-color: #EF4444 !important;
          box-shadow: 0 12px 30px rgba(239, 68, 68, 0.1) !important;
        }
        .button-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #FFFFFF;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }
      `}</style>
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
