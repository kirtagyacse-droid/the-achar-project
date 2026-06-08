"use client";
import React from 'react';

interface SettingsTabProps {
  isWhatsAppAlertConfigured: boolean;
  onLogout: () => void;
}

export default function SettingsTab({ isWhatsAppAlertConfigured, onLogout }: SettingsTabProps) {
  return (
    <div className="admin-section">
      <div className="admin-premium-card" style={{ marginBottom: '24px' }}>
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>⚙️ System Settings & Alerts</h3>
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Verify and configure the external integration status for order dispatch alerts and notification pipelines.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '20px',
              border: '1px solid var(--admin-border)',
              backgroundColor: '#FAFAFA',
              borderRadius: '4px'
            }}
          >
            <div>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: 'var(--admin-text)' }}>
                WhatsApp Checkout Alerts (CallMeBot)
              </strong>
              <span style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', marginTop: '4px', display: 'block' }}>
                Status of the background WhatsApp notifications agent.
              </span>
            </div>

            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                backgroundColor: isWhatsAppAlertConfigured ? 'var(--admin-success-light)' : 'var(--admin-warning-light)',
                color: isWhatsAppAlertConfigured ? 'var(--admin-success)' : 'var(--admin-warning)',
                border: `1px solid ${isWhatsAppAlertConfigured ? 'rgba(21, 128, 61, 0.2)' : 'rgba(180, 83, 9, 0.2)'}`
              }}
            >
              {isWhatsAppAlertConfigured ? '✓ Connected & Active' : '⚠️ Missing Key API Key'}
            </div>
          </div>
          
          <div style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', lineHeight: '1.5' }}>
            Note: WhatsApp alerts run on the server using the configured <code>CALLMEBOT_API_KEY</code> and <code>AUNTY_WHATSAPP_NUMBER</code> credentials. If alerts are inactive, please specify them in your environment variables.
          </div>
        </div>
      </div>

      {/* Session Settings */}
      <div className="admin-premium-card">
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>🔐 Session & Access</h3>
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Manage your current browser login session. Token automatically expires after 7 days of inactivity.
        </p>

        <button 
          onClick={onLogout}
          className="admin-logout-btn"
          style={{
            backgroundColor: 'var(--admin-maroon)',
            color: 'white',
            borderColor: 'var(--admin-maroon)',
            padding: '12px 24px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          🚪 Terminate Current Session
        </button>
      </div>
    </div>
  );
}
