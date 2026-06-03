"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function FirstTimerBanner({ starterTrioId }: { starterTrioId?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasOrderHistory = localStorage.getItem('achar_order_history_placed') === 'true';
    const isDismissed = localStorage.getItem('achar_starter_banner_dismissed') === 'true';

    if (!hasOrderHistory && !isDismissed && starterTrioId) {
      setVisible(true);
    }
  }, [starterTrioId]);

  const handleDismiss = () => {
    localStorage.setItem('achar_starter_banner_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      backgroundColor: 'var(--color-accent)',
      color: 'white',
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '0.95rem',
      fontWeight: 500,
      position: 'relative',
      animation: 'slideDownFade 0.3s ease',
      zIndex: 50
    }}>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <span>✨ New here? Find your perfect flavor with </span>
        <Link 
          href={`/products/${starterTrioId}`} 
          style={{ textDecoration: 'underline', color: '#FFF', fontWeight: 700, marginLeft: '4px' }}
        >
          Aunty's Starter Trio (Save ₹51) &rarr;
        </Link>
      </div>
      <button 
        type="button" 
        onClick={handleDismiss} 
        style={{ 
          background: 'none', 
          border: 'none', 
          color: 'rgba(255,255,255,0.8)', 
          fontSize: '1.4rem', 
          cursor: 'pointer',
          padding: '0 8px',
          display: 'flex',
          alignItems: 'center'
        }}
        aria-label="Dismiss banner"
      >
        &times;
      </button>
    </div>
  );
}
