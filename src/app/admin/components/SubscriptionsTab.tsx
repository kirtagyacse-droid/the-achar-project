"use client";
import React from 'react';
import { Subscription } from '../AdminClient';

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
}

export default function SubscriptionsTab({ subscriptions }: SubscriptionsTabProps) {
  const activeMembers = subscriptions.filter(s => s.isActive);
  const totalPlanJars = activeMembers.reduce((sum, s) => sum + s.planJars, 0);

  return (
    <div className="admin-section">
      <div className="admin-premium-card" style={{ marginBottom: '24px' }}>
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>📬 Achar Club Subscriptions</h3>
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Overview of monthly recurring subscription deliveries for our Achar Club members.
        </p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Active Members</span>
            <strong style={{ fontSize: '2.5rem', color: 'var(--admin-maroon)' }}>{activeMembers.length}</strong>
          </div>
          <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Jars Dispatched / Month</span>
            <strong style={{ fontSize: '2.5rem', color: 'var(--admin-text)' }}>{totalPlanJars} Jars</strong>
          </div>
        </div>

        <h4 style={{ fontSize: '1.05rem', marginBottom: '12px', fontWeight: '700' }}>Subscribers Directory:</h4>
        {subscriptions.length === 0 ? (
          <p style={{ color: 'var(--admin-muted)', fontSize: '0.95rem', textAlign: 'center', padding: '20px' }}>No club subscribers enrolled yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
            {subscriptions.map(sub => (
              <div 
                key={sub.id} 
                style={{ 
                  border: '1px solid var(--admin-border)', 
                  padding: '16px', 
                  fontSize: '0.95rem', 
                  backgroundColor: sub.isActive ? '#FFFFFF' : '#F4F4F5',
                  opacity: sub.isActive ? 1 : 0.7 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span style={{ fontSize: '1.1rem' }}>{sub.customerName}</span>
                  <span style={{ color: 'var(--admin-maroon)' }}>{sub.planJars} Jars / month</span>
                </div>
                
                <div style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>
                  <strong>Phone:</strong> {sub.phone} {sub.email ? ` | Email: ${sub.email}` : ''}<br />
                  <strong>Address:</strong> {sub.address}
                </div>

                {sub.notes && (
                  <div style={{ fontStyle: 'italic', backgroundColor: '#F9F9FB', padding: '8px 12px', borderLeft: '2px solid var(--admin-border)', marginTop: '8px', fontSize: '0.85rem' }}>
                    Notes: &quot;{sub.notes}&quot;
                  </div>
                )}

                {sub.nextDelivery && sub.isActive && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--admin-success)', marginTop: '8px', fontWeight: 600 }}>
                    📅 Next Scheduled Dispatch: {new Date(sub.nextDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subscription Placeholder Upgrades */}
      <div className="admin-premium-card" style={{ borderStyle: 'dashed', backgroundColor: 'transparent' }}>
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>🚀 Future Club Automation</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--admin-muted)', margin: 0 }}>
          Phase 3 will support automated customer credit card recurring charges, customer portal jar selection interfaces, customizable email dispatch alerts, and custom shipping integrations.
        </p>
      </div>
    </div>
  );
}
