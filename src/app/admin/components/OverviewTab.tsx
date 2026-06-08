"use client";
import React from 'react';
import { Order, Product, FestivalAlert, Referral, KitchenTarget, Subscription, StockAdjustment } from '../AdminClient';
import { TabType } from './AdminShell';

interface OverviewTabProps {
  orders: Order[];
  products: Product[];
  alerts: FestivalAlert[];
  referrals: Referral[];
  kitchenTargets: KitchenTarget[];
  setActiveTab: (tab: TabType) => void;
  setAlerts: React.Dispatch<React.SetStateAction<FestivalAlert[]>>;
  subscriptions: Subscription[];
  stockAdjustments: StockAdjustment[];
}

export default function OverviewTab({
  orders,
  products,
  alerts,
  referrals,
  kitchenTargets,
  setActiveTab,
  setAlerts,
  subscriptions,
  stockAdjustments
}: OverviewTabProps) {

  // Daily statistics
  const todayStr = new Date().toDateString();
  const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const jarsSoldToday = ordersToday.reduce((sum, o) => {
    return sum + o.items.reduce((s: number, item) => s + item.quantity, 0);
  }, 0);
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingTargets = kitchenTargets.filter(t => t.status !== 'packed');

  // Revenue analytics
  const codOrders = orders.filter(o => o.paymentMethod === 'COD');
  const codRevenueTotal = codOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
  const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter(o => ['NEW', 'CONFIRMED', 'PACKED', 'DISPATCHED'].includes(o.status));
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const aov = orders.length > 0 ? totalRevenue / orders.length : 0;

  // Repeat customers
  const customerOrders: Record<string, number> = {};
  orders.forEach(o => {
    customerOrders[o.phone] = (customerOrders[o.phone] || 0) + 1;
  });
  const totalUniqueCustomers = Object.keys(customerOrders).length;
  const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;
  const repeatCustomerRate = totalUniqueCustomers > 0 ? (repeatCustomers / totalUniqueCustomers) * 100 : 0;

  // Referral sales contribution
  const referredOrders = orders.filter(o => o.referralCode);
  const referralRevenue = referredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const referralShare = totalRevenue > 0 ? (referralRevenue / totalRevenue) * 100 : 0;

  // Subscriptions recurring revenue (MRR) projection (assuming ₹180 average per jar)
  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const totalActiveSubJars = activeSubscriptions.reduce((sum, s) => sum + s.planJars, 0);
  const projectedMRR = totalActiveSubJars * 180;

  // 7-day sales comparison trend
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const startOfLast7Days = new Date(now.getTime() - 7 * oneDayMs);
  const startOfPrev7Days = new Date(now.getTime() - 14 * oneDayMs);

  const salesLast7Days = orders
    .filter(o => {
      const d = new Date(o.createdAt);
      return d >= startOfLast7Days && d <= now;
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const salesPrev7Days = orders
    .filter(o => {
      const d = new Date(o.createdAt);
      return d >= startOfPrev7Days && d < startOfLast7Days;
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const trendPercentage = salesPrev7Days > 0 
    ? ((salesLast7Days - salesPrev7Days) / salesPrev7Days) * 100
    : 0;

  // Order funnel counts
  const countByStatus = (status: string) => orders.filter(o => o.status === status).length;
  const newOrders = countByStatus('NEW');
  const confirmedOrders = countByStatus('CONFIRMED');
  const packedOrders = countByStatus('PACKED');
  const dispatchedOrders = countByStatus('DISPATCHED');
  const deliveredOrdersCount = countByStatus('DELIVERED');

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
            <div className="admin-metric-lbl">Total Sales (All Time)</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🥣</div>
          <div className="admin-metric-info">
            <div className="admin-metric-val">{pendingTargets.length}</div>
            <div className="admin-metric-lbl">Kitchen Targets Left</div>
          </div>
        </div>
      </div>

      {/* Analytics & Owner Insights Dashboard */}
      <h3 className="admin-sec-title" style={{ marginTop: '36px', marginBottom: '16px' }}>📊 Business Analytics & Owner Insights</h3>
      <div className="admin-grid-3" style={{ marginBottom: '36px' }}>
        {/* Revenue Health split card */}
        <div className="admin-premium-card" style={{ margin: 0 }}>
          <div className="admin-card-header-lux">
            <span className="admin-card-subtitle-lux">Revenue Health</span>
            <h4 className="admin-card-title-lux" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Cash & Status Flow</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span>🛵 Cash on Delivery (COD)</span>
              <strong>₹{codRevenueTotal.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--admin-success)' }}>
              <span>Delivered Revenue</span>
              <strong>₹{deliveredRevenue.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#B57C1E' }}>
              <span>Pending in Transit</span>
              <strong>₹{pendingRevenue.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ 
              marginTop: '8px', 
              height: '6px', 
              borderRadius: '3px', 
              backgroundColor: 'var(--admin-border)',
              overflow: 'hidden',
              display: 'flex'
            }}>
              <div style={{ 
                width: `${totalRevenue > 0 ? (deliveredRevenue / totalRevenue) * 100 : 0}%`, 
                backgroundColor: 'var(--admin-success)' 
              }} />
              <div style={{ 
                width: `${totalRevenue > 0 ? (pendingRevenue / totalRevenue) * 100 : 0}%`, 
                backgroundColor: '#B57C1E' 
              }} />
            </div>
          </div>
        </div>

        {/* Sales Trend & AOV card */}
        <div className="admin-premium-card" style={{ margin: 0 }}>
          <div className="admin-card-header-lux">
            <span className="admin-card-subtitle-lux">Order Values & Trends</span>
            <h4 className="admin-card-title-lux" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Performance Comparison</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span>🛍️ Average Order Value (AOV)</span>
              <strong>₹{Math.round(aov).toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span>Sales (Last 7 Days)</span>
              <strong>₹{salesLast7Days.toLocaleString('en-IN')}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', alignItems: 'center' }}>
              <span>Weekly Growth</span>
              {trendPercentage >= 0 ? (
                <span style={{ 
                  color: 'var(--admin-success)', 
                  fontWeight: '700', 
                  backgroundColor: 'var(--admin-success-light)', 
                  padding: '2px 8px', 
                  borderRadius: '3px',
                  fontSize: '0.85rem'
                }}>
                  ▲ +{trendPercentage.toFixed(1)}%
                </span>
              ) : (
                <span style={{ 
                  color: 'var(--admin-maroon)', 
                  fontWeight: '700', 
                  backgroundColor: 'var(--admin-maroon-light)', 
                  padding: '2px 8px', 
                  borderRadius: '3px',
                  fontSize: '0.85rem'
                }}>
                  ▼ {trendPercentage.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Loyalty & Subscriptions card */}
        <div className="admin-premium-card" style={{ margin: 0 }}>
          <div className="admin-card-header-lux">
            <span className="admin-card-subtitle-lux">Retention & Loyalty</span>
            <h4 className="admin-card-title-lux" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>Referrals & Subscription</h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span>🔄 Repeat Customer Rate</span>
              <strong>{repeatCustomerRate.toFixed(1)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span>🔗 Referral Contribution</span>
              <strong>₹{referralRevenue.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>({referralShare.toFixed(0)}%)</span></strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: 'var(--admin-maroon)' }}>
              <span>📬 Projected Subscriptions MRR</span>
              <strong>₹{projectedMRR.toLocaleString('en-IN')}</strong>
            </div>
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
              <strong style={{ color: 'var(--admin-success)' }}>{deliveredOrdersCount} orders</strong>
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
