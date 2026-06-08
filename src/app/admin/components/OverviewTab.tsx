"use client";
import React from 'react';
import { Order, Product, FestivalAlert, Referral, KitchenTarget } from '../AdminClient';
import { TabType } from './AdminShell';

interface OverviewTabProps {
  orders: Order[];
  products: Product[];
  alerts: FestivalAlert[];
  referrals: Referral[];
  kitchenTargets: KitchenTarget[];
  setActiveTab: (tab: TabType) => void;
  setAlerts: React.Dispatch<React.SetStateAction<FestivalAlert[]>>;
}

export default function OverviewTab({
  orders,
  products,
  alerts,
  referrals,
  kitchenTargets,
  setActiveTab,
  setAlerts
}: OverviewTabProps) {

  // Daily statistics
  const todayStr = new Date().toDateString();
  const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const jarsSoldToday = ordersToday.reduce((sum, o) => {
    return sum + o.items.reduce((s: number, item) => s + item.quantity, 0);
  }, 0);
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingTargets = kitchenTargets.filter(t => t.status !== 'packed');
  
  // Order funnel counts
  const countByStatus = (status: string) => orders.filter(o => o.status === status).length;
  const newOrders = countByStatus('NEW');
  const confirmedOrders = countByStatus('CONFIRMED');
  const packedOrders = countByStatus('PACKED');
  const dispatchedOrders = countByStatus('DISPATCHED');
  const deliveredOrders = countByStatus('DELIVERED');

  // Low stock list
  const lowStockProducts = products.filter(p => p.stockCount < 10);

  // Recent referrals
  const recentReferrals = referrals.slice(0, 5);

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
      {/* Active Festival Alerts Banner List */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
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
                  padding: '16px 24px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(154, 44, 44, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🪔</span>
                  <span style={{ fontWeight: '600', letterSpacing: '0.02em' }}>
                    {alert.name} is in {daysLeft} days — prepare stocking targets!
                  </span>
                </div>
                <button 
                  onClick={() => handleDismissAlert(alert.id)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.4)',
                    padding: '6px 12px',
                    borderRadius: '2px',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Metrics Row */}
      <div className="admin-grid-3">
        <div className="admin-metric-card">
          <div className="admin-metric-icon">🫙</div>
          <div className="admin-metric-info">
            <div className="admin-metric-val">{jarsSoldToday}</div>
            <div className="admin-metric-lbl">Jars Sold Today</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">₹</div>
          <div className="admin-metric-info">
            <div className="admin-metric-val">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="admin-metric-lbl">Total Sales (COD)</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🥣</div>
          <div className="admin-metric-info">
            <div className="admin-metric-val">{pendingTargets.length}</div>
            <div className="admin-metric-lbl">Prep Targets Left</div>
          </div>
        </div>
      </div>

      {/* Order Funnel & Low Stock */}
      <div className="admin-grid-2">
        {/* Order Status Funnel */}
        <div className="admin-premium-card">
          <div className="admin-card-header-lux">
            <span className="admin-card-subtitle-lux">Operations</span>
            <h3 className="admin-card-title-lux">Order Funnel Summary</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--admin-border)' }}>
              <span>🆕 New Orders (Pending confirmation)</span>
              <strong style={{ color: 'var(--admin-maroon)' }}>{newOrders} orders</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--admin-border)' }}>
              <span>👍 Confirmed (Ready to prep/pack)</span>
              <strong>{confirmedOrders} orders</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--admin-border)' }}>
              <span>📦 Packed (Proof uploaded/nudge sent)</span>
              <strong>{packedOrders} orders</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--admin-border)' }}>
              <span>🚴 Out for Delivery / Dispatched</span>
              <strong>{dispatchedOrders} orders</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: 'var(--admin-success-light)' }}>
              <span style={{ color: 'var(--admin-success)', fontWeight: '600' }}>✅ Total Delivered Orders</span>
              <strong style={{ color: 'var(--admin-success)' }}>{deliveredOrders} orders</strong>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-premium-card">
          <div className="admin-card-header-lux">
            <span className="admin-card-subtitle-lux">Inventory Alert</span>
            <h3 className="admin-card-title-lux">Low Stock List (&lt; 10 Jars)</h3>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: '250px' }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ color: 'var(--admin-success)', padding: '24px', textAlign: 'center', fontWeight: '600' }}>
                🟢 All pickles are well-stocked!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {lowStockProducts.map(p => (
                  <div key={p.id} className="admin-alert-banner" style={{ margin: 0 }}>
                    <span>⚠️ <strong>{p.name}</strong> is running low</span>
                    <strong>{p.stockCount} jars left</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            className="admin-logout-btn"
            style={{ marginTop: '16px', alignSelf: 'flex-start', padding: '8px 16px' }}
          >
            Update Inventory Stock
          </button>
        </div>
      </div>

      {/* Referrals & Quick Actions */}
      <div className="admin-grid-2">
        {/* Recent Referral Activity */}
        <div className="admin-premium-card">
          <div className="admin-card-header-lux">
            <span className="admin-card-subtitle-lux">Loyalty</span>
            <h3 className="admin-card-title-lux">Recent Referrals Snapshot</h3>
          </div>

          <div style={{ flexGrow: 1 }}>
            {recentReferrals.length === 0 ? (
              <div style={{ color: 'var(--admin-muted)', padding: '20px', textAlign: 'center' }}>
                No referral codes generated yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recentReferrals.map(ref => (
                  <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--admin-border)', backgroundColor: '#FAFAFA' }}>
                    <div>
                      <strong>{ref.referrerName}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginLeft: '12px' }}>Code: <code>{ref.referralCode}</code></span>
                    </div>
                    <span>
                      {ref.isUsed ? (
                        <span style={{ color: 'var(--admin-success)', fontWeight: '600', fontSize: '0.85rem' }}>Used</span>
                      ) : (
                        <span style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>Active</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="admin-premium-card" style={{ backgroundColor: 'var(--admin-cream)' }}>
          <div className="admin-card-header-lux">
            <span className="admin-card-subtitle-lux">Admin Shortcuts</span>
            <h3 className="admin-card-title-lux">Quick Actions</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flexGrow: 1 }}>
            <button 
              onClick={() => setActiveTab('kitchen')} 
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--admin-border)',
                padding: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              className="quick-action-btn"
            >
              <span style={{ fontSize: '1.5rem' }}>🥣</span>
              <span>Open Kitchen View</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('orders')} 
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--admin-border)',
                padding: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              className="quick-action-btn"
            >
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <span>Manage Pending Orders</span>
            </button>

            <button 
              onClick={() => setActiveTab('inventory')} 
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--admin-border)',
                padding: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              className="quick-action-btn"
            >
              <span style={{ fontSize: '1.5rem' }}>➕</span>
              <span>Add New Pickle</span>
            </button>

            <button 
              onClick={() => setActiveTab('diary')} 
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--admin-border)',
                padding: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center'
              }}
              className="quick-action-btn"
            >
              <span style={{ fontSize: '1.5rem' }}>✍️</span>
              <span>Write Diary Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
