"use client";
import React, { useState } from 'react';
import { PicklePassport, JarReturn, Order } from '../AdminClient';

interface CustomersTabProps {
  passports: PicklePassport[];
  setPassports: React.Dispatch<React.SetStateAction<PicklePassport[]>>;
  jarReturns: JarReturn[];
  orders: Order[];
  sentNudgeIds: string[];
  setSentNudgeIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function CustomersTab({
  passports,
  setPassports,
  jarReturns,
  orders,
  sentNudgeIds,
  setSentNudgeIds
}: CustomersTabProps) {
  const [subSection, setSubSection] = useState<'loyalty' | 'nudges'>('loyalty');

  const handleClaimPassport = async (passport: PicklePassport) => {
    if (!confirm(`Mark free jar claimed for ${passport.customerName}?`)) return;
    try {
      const res = await fetch(`/api/admin/claim-passport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: passport.phone })
      });
      if (res.ok) {
        setPassports(prev => prev.map(p => p.phone === passport.phone ? { ...p, freeJarClaimed: true } : p));
      } else {
        alert('Failed to claim free jar');
      }
    } catch (err) {
      console.error('Error claiming passport jar', err);
      alert('Error claiming passport jar');
    }
  };

  // Re-stock reminders list logic
  const now = new Date();
  const remindersList = orders.filter(order => {
    if (order.status.toUpperCase() !== 'DELIVERED') return false;
    
    const orderDate = new Date(order.createdAt);
    const diffInMs = now.getTime() - orderDate.getTime();
    const diffInMonths = diffInMs / (1000 * 60 * 60 * 24 * 30.44);

    if (diffInMonths < 11 || diffInMonths > 13) return false;

    // Check for subsequent reorders
    const hasNewerOrder = orders.some(o => 
      o.phone.replace(/[^0-9]/g, '') === order.phone.replace(/[^0-9]/g, '') &&
      new Date(o.createdAt).getTime() > orderDate.getTime()
    );
    if (hasNewerOrder) return false;

    // Verify not already sent in this session
    if (sentNudgeIds.includes(order.id)) return false;

    return true;
  });

  return (
    <div className="admin-section">
      {/* Sub navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', marginBottom: '24px', gap: '20px' }}>
        <button
          onClick={() => setSubSection('loyalty')}
          style={{
            padding: '12px 6px',
            border: 'none',
            borderBottom: subSection === 'loyalty' ? '2px solid var(--admin-maroon)' : '2px solid transparent',
            background: 'transparent',
            fontWeight: subSection === 'loyalty' ? '700' : '500',
            color: subSection === 'loyalty' ? 'var(--admin-maroon)' : 'var(--admin-text)',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Loyalty & Returns
        </button>
        <button
          onClick={() => setSubSection('nudges')}
          style={{
            padding: '12px 6px',
            border: 'none',
            borderBottom: subSection === 'nudges' ? '2px solid var(--admin-maroon)' : '2px solid transparent',
            background: 'transparent',
            fontWeight: subSection === 'nudges' ? '700' : '500',
            color: subSection === 'nudges' ? 'var(--admin-maroon)' : 'var(--admin-text)',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          ⏰ Re-stock Nudges ({remindersList.length})
        </button>
      </div>

      {subSection === 'loyalty' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Passports */}
          <div className="admin-premium-card">
            <div className="admin-card-header-lux">
              <span className="admin-card-subtitle-lux">Loyalty Stamps</span>
              <h3 className="admin-card-title-lux">Pickle Passports ({passports.length})</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '12px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: '600' }}>Passports Created</span>
                <strong style={{ fontSize: '1.75rem', color: 'var(--admin-text)' }}>{passports.length}</strong>
              </div>
              <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '12px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: '600' }}>Completed Stamps</span>
                <strong style={{ fontSize: '1.75rem', color: 'var(--admin-success)' }}>
                  {passports.filter(p => p.isComplete).length}
                </strong>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: '700' }}>Unclaimed Completion Rewards:</h4>
            {passports.filter(p => p.isComplete && !p.freeJarClaimed).length === 0 ? (
              <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No completed unclaimed passports.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {passports.filter(p => p.isComplete && !p.freeJarClaimed).map(p => (
                  <div key={p.id} style={{ border: '1px solid rgba(21, 128, 61, 0.2)', backgroundColor: 'var(--admin-success-light)', padding: '12px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--admin-success)' }}>{p.customerName}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '2px' }}>Phone: {p.phone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleClaimPassport(p)}
                      style={{
                        backgroundColor: 'var(--admin-success)',
                        color: 'white',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      🎁 Claim Free Jar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jar Returns */}
          <div className="admin-premium-card">
            <div className="admin-card-header-lux">
              <span className="admin-card-subtitle-lux">Recycling Program</span>
              <h3 className="admin-card-title-lux">♻️ Jar Return Requests</h3>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '12px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: '600' }}>Logged Returns</span>
                <strong style={{ fontSize: '1.75rem', color: 'var(--admin-text)' }}>{jarReturns.length}</strong>
              </div>
              <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '12px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: '600' }}>Jars Recycled</span>
                <strong style={{ fontSize: '1.75rem', color: 'var(--admin-maroon)' }}>
                  {jarReturns.reduce((sum, r) => sum + r.jarCount, 0)} Jars
                </strong>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: '700' }}>Logged Requests:</h4>
            {jarReturns.length === 0 ? (
              <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No return logs registered.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {jarReturns.map(ret => (
                  <div key={ret.id} style={{ border: '1px solid var(--admin-border)', padding: '12px', fontSize: '0.9rem', backgroundColor: ret.discountApplied ? '#FAFAFA' : '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{ret.customerName}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                        Phone: {ret.phone} | Jars: <strong style={{ color: 'var(--admin-maroon)' }}>{ret.jarCount}</strong>
                      </div>
                    </div>
                    <div>
                      {ret.discountApplied ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', fontWeight: '600', padding: '4px 8px', backgroundColor: '#E4E4E7' }}>
                          ✓ Applied
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--admin-maroon)', fontWeight: '600', padding: '4px 8px', backgroundColor: 'var(--admin-maroon-light)', border: '1px solid rgba(154, 44, 44, 0.2)' }}>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* NUDGES PANEL */
        <div className="admin-premium-card" style={{ margin: 0 }}>
          <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>⏰ Restock Retention Reminders</h3>
          <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Identify customers whose last delivered purchase was 11-13 months ago. Engage them via pre-populated WhatsApp restock nudges.
          </p>

          {remindersList.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--admin-muted)' }}>
              ✓ No active restock nudges required at this time.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {remindersList.map(order => {
                const orderDateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const productsList = order.items.map(item => `${item.product?.name || 'Deleted Product'} (x${item.quantity})`).join(', ');

                return (
                  <div 
                    key={order.id} 
                    style={{
                      border: '1px solid var(--admin-border)',
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ flex: '1 1 300px' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--admin-text)' }}>{order.customerName}</strong>
                      <div style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                        Purchased <strong>{productsList}</strong> on <strong>{orderDateFormatted}</strong>.
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                        Phone: {order.phone} | Order Ref: #{order.id.substring(0, 8).toUpperCase()}
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const cleanPhone = order.phone.replace(/[^0-9]/g, '');
                        const itemsString = order.items.map(item => item.product?.name || 'achar').join(' and ');
                        const siteUrl = window.location.origin;
                        const message = `Namaste ${order.customerName}! 🫙 It's been almost a year since you last ordered from us. Aunty has fresh ${itemsString} ready — shall we send you a jar? Order here: ${siteUrl} or reply to this message. 💛`;
                        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                        
                        const updatedNudgeIds = [...sentNudgeIds, order.id];
                        localStorage.setItem('nudge_sent_order_ids', JSON.stringify(updatedNudgeIds));
                        setSentNudgeIds(updatedNudgeIds);
                        
                        window.open(whatsappUrl, '_blank');
                      }}
                      className="admin-logout-btn"
                      style={{ padding: '10px 16px', border: '1px solid var(--admin-maroon)', color: 'var(--admin-maroon)' }}
                    >
                      💬 Send WhatsApp Nudge
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
