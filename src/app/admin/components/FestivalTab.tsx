"use client";
import React from 'react';
import { FestivalAlert } from '../AdminClient';

interface FestivalTabProps {
  alerts: FestivalAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<FestivalAlert[]>>;
}

export default function FestivalTab({ alerts, setAlerts }: FestivalTabProps) {
  
  const handleDismissAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/admin/festivals/dismiss', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId })
      });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      } else {
        alert('Failed to dismiss alert');
      }
    } catch (error) {
      console.error('Error dismissing alert', error);
      alert('Error dismissing alert');
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-premium-card">
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>🏮 Festival Stocking Alerts</h3>
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Upcoming major Indian festivals are automatically tracked here. Active prep alerts appear 2–3 weeks before each festival.
        </p>

        {alerts.length === 0 ? (
          <div className="no-items-text" style={{ borderStyle: 'dashed', backgroundColor: 'transparent' }}>
            ✓ No active stocking alerts at this moment. You are fully prepared.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map(alert => {
              const daysLeft = Math.ceil(
                (new Date(alert.festivalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div 
                  key={alert.id}
                  style={{
                    background: 'linear-gradient(90deg, #9A2C2C 0%, #7B1C1C 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 4px 12px rgba(154, 44, 44, 0.12)'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🪔 {alert.name}
                    </strong>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', marginTop: '4px', display: 'block' }}>
                      Festival is in {daysLeft} days — stock up safety buffer margins!
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleDismissAlert(alert.id)}
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.4)',
                      padding: '8px 16px',
                      borderRadius: '2px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Dismiss Alert
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
