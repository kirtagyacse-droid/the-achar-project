"use client";
import React from 'react';

interface Referral {
  id: string;
  referrerPhone: string;
  referrerName: string;
  referralCode: string;
  usedByPhone: string | null;
  usedByName: string | null;
  referrerCredit: number;
  refereeDiscount: number;
  isUsed: boolean;
  createdAt: string | Date;
}

interface ReferralsTabProps {
  referrals: Referral[];
}

export default function ReferralsTab({ referrals }: ReferralsTabProps) {
  const completedReferrals = referrals.filter(r => r.isUsed);
  const totalPayoutRupees = completedReferrals.reduce((sum, r) => sum + r.referrerCredit, 0);

  return (
    <div className="admin-section">
      <div className="admin-premium-card" style={{ marginBottom: '24px' }}>
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>🔗 Customer Referral Program</h3>
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
          Monitor the virality of our customer referral program, listing active codes and completed friend checkouts.
        </p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
          <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Total Codes Generated</span>
            <strong style={{ fontSize: '2.5rem', color: 'var(--admin-text)' }}>{referrals.length}</strong>
          </div>
          <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Redeemed Referrals</span>
            <strong style={{ fontSize: '2.5rem', color: 'var(--admin-success)' }}>{completedReferrals.length}</strong>
          </div>
          <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '16px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Earned Referrer Credit</span>
            <strong style={{ fontSize: '2.5rem', color: 'var(--admin-maroon)' }}>₹{totalPayoutRupees}</strong>
          </div>
        </div>

        <h4 style={{ fontSize: '1.05rem', marginBottom: '12px', fontWeight: '700' }}>Referrals List:</h4>
        {referrals.length === 0 ? (
          <p style={{ color: 'var(--admin-muted)', fontSize: '0.95rem', textAlign: 'center', padding: '20px' }}>No customer referrals registered yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
            {referrals.map(ref => (
              <div 
                key={ref.id} 
                style={{ 
                  border: '1px solid var(--admin-border)', 
                  padding: '16px', 
                  fontSize: '0.95rem', 
                  backgroundColor: ref.isUsed ? '#F9F9FB' : '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '1.1rem' }}>{ref.referrerName}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginLeft: '12px' }}>Phone: {ref.referrerPhone}</span>
                  </div>
                  
                  <span style={{ 
                    backgroundColor: ref.isUsed ? 'var(--admin-success-light)' : '#F3F4F6', 
                    color: ref.isUsed ? 'var(--admin-success)' : 'var(--admin-muted)', 
                    padding: '4px 10px', 
                    borderRadius: '20px',
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    border: `1px solid ${ref.isUsed ? 'rgba(21, 128, 61, 0.2)' : 'var(--admin-border)'}`
                  }}>
                    {ref.isUsed ? '✓ Completed' : 'Active'}
                  </span>
                </div>

                <div style={{ marginTop: '8px', fontSize: '0.9rem', display: 'flex', gap: '20px' }}>
                  <div>
                    <span style={{ color: 'var(--admin-muted)' }}>Promo Code: </span>
                    <code style={{ fontSize: '1rem', color: 'var(--admin-maroon)', fontWeight: 'bold' }}>{ref.referralCode}</code>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-muted)' }}>Referrer Credit: </span>
                    <strong>₹{ref.referrerCredit}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--admin-muted)' }}>Referee Discount: </span>
                    <strong>₹{ref.refereeDiscount}</strong>
                  </div>
                </div>

                {ref.isUsed && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#FAFAFA', borderLeft: '3px solid var(--admin-success)', fontSize: '0.85rem' }}>
                    👥 <strong>Redeemed by:</strong> {ref.usedByName || 'Friend'} (Phone: {ref.usedByPhone || 'N/A'})
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
