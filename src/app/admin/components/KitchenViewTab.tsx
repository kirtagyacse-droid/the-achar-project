"use client";
import React, { useState } from 'react';
import { KitchenTarget, Product, Order } from '../AdminClient';
import { TabType } from './AdminShell';

interface KitchenViewTabProps {
  kitchenTargets: KitchenTarget[];
  setKitchenTargets: React.Dispatch<React.SetStateAction<KitchenTarget[]>>;
  products: Product[];
  orders: Order[];
  setActiveTab: (tab: TabType) => void;
}

export default function KitchenViewTab({
  kitchenTargets,
  setKitchenTargets,
  products,
  orders,
  setActiveTab
}: KitchenViewTabProps) {
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetProductId, setNewTargetProductId] = useState('');
  const [newTargetQuantity, setNewTargetQuantity] = useState(5);
  const [newTargetNotes, setNewTargetNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<{
    daily?: {
      time: string[];
      uv_index_max: number[];
      precipitation_sum: number[];
      temperature_2m_max: number[];
    };
  } | null>(null);

  React.useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('/api/admin/weather');
        if (res.ok) {
          const data = await res.json();
          setWeatherData(data);
        }
      } catch (err) {
        console.error('Failed to load weather in kitchen', err);
      }
    }
    fetchWeather();
  }, []);

  const getBatchScheduleInfo = (prod: Product) => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentItems = orders
      .filter(o => new Date(o.createdAt) >= fourteenDaysAgo)
      .flatMap(o => o.items)
      .filter(i => i.productId === prod.id);

    const soldQty = recentItems.reduce((sum, i) => sum + i.quantity, 0);
    const dailyBurn = soldQty / 14;

    const pendingOrderQty = orders
      .filter(o => ['NEW', 'CONFIRMED', 'PACKED'].includes(o.status))
      .flatMap(o => o.items)
      .filter(i => i.productId === prod.id)
      .reduce((sum, i) => sum + i.quantity, 0);

    const netAvailableStock = prod.stockCount - pendingOrderQty;
    const rateToUse = dailyBurn > 0 ? dailyBurn : 0.05;
    const depletionDays = netAvailableStock > 0 ? netAvailableStock / rateToUse : 0;

    let baseDryingTime = 5;
    const lowerName = prod.name.toLowerCase();
    if (lowerName.includes('mango')) baseDryingTime = 7;
    else if (lowerName.includes('chili') || lowerName.includes('mirch')) baseDryingTime = 4;
    else if (lowerName.includes('lemon') || lowerName.includes('nimbu')) baseDryingTime = 10;

    let rainDelayDays = 0;
    if (weatherData && weatherData.daily) {
      weatherData.daily.precipitation_sum.forEach((p: number) => {
        if (p > 1.5) rainDelayDays += 0.8;
      });
    }

    const totalLeadTime = baseDryingTime + Math.round(rainDelayDays);
    const depletionDate = new Date();
    depletionDate.setDate(depletionDate.getDate() + Math.round(depletionDays));
    
    const recommendedBatchDate = new Date(depletionDate);
    recommendedBatchDate.setDate(recommendedBatchDate.getDate() - totalLeadTime);

    return {
      recommendedBatchDate,
      totalLeadTime,
      isClose: depletionDays <= 5
    };
  };

  // Persistent General Kitchen Notes notepad (using localStorage)
  const [generalNotes, setGeneralNotes] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rs_savoury_general_kitchen_notes') || '';
    }
    return '';
  });

  const saveGeneralNotes = (val: string) => {
    setGeneralNotes(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rs_savoury_general_kitchen_notes', val);
    }
  };

  // Quick adjust handlers
  const handleUpdateQuantity = async (id: string, currentQty: number, change: number) => {
    const nextQty = Math.max(0, currentQty + change);
    try {
      const res = await fetch(`/api/admin/kitchen-targets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetQuantity: nextQty })
      });
      if (res.ok) {
        const data = await res.json();
        setKitchenTargets(prev => prev.map(t => t.id === id ? data.target : t));
      }
    } catch (error) {
      console.error('Failed to update quantity', error);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/kitchen-targets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setKitchenTargets(prev => prev.map(t => t.id === id ? data.target : t));
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleUpdateNotes = async (id: string, newNotes: string) => {
    try {
      const res = await fetch(`/api/admin/kitchen-targets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNotes })
      });
      if (res.ok) {
        const data = await res.json();
        setKitchenTargets(prev => prev.map(t => t.id === id ? data.target : t));
      }
    } catch (error) {
      console.error('Failed to update notes', error);
    }
  };

  const handleDeleteTarget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this target?')) return;
    try {
      const res = await fetch(`/api/admin/kitchen-targets/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setKitchenTargets(prev => prev.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete target', error);
    }
  };

  // Create new manual target
  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    let name = newTargetName.trim();
    
    // If product is selected from dropdown, use its name
    if (newTargetProductId) {
      const matchedProd = products.find(p => p.id === newTargetProductId);
      if (matchedProd) {
        name = matchedProd.name;
      }
    }

    if (!name) {
      alert('Please select a product or enter a custom target name.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/kitchen-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: newTargetProductId || null,
          productName: name,
          targetQuantity: newTargetQuantity,
          notes: newTargetNotes.trim() || null,
          status: 'pending'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setKitchenTargets(prev => [...prev, data.target]);
        // Reset form
        setNewTargetName('');
        setNewTargetProductId('');
        setNewTargetQuantity(5);
        setNewTargetNotes('');
      } else {
        alert('Failed to add target.');
      }
    } catch (error) {
      console.error('Error creating target', error);
      alert('Error creating target.');
    } finally {
      setLoading(false);
    }
  };

  // Load Targets from Pending Orders
  const handleAutoPopulateTargets = async () => {
    // Collect order items from all orders that are NEW or CONFIRMED
    const pendingOrders = orders.filter(o => ['NEW', 'CONFIRMED'].includes(o.status));
    
    if (pendingOrders.length === 0) {
      alert('No pending orders (NEW or CONFIRMED) found to aggregate.');
      return;
    }

    // Sum quantities by product
    const aggregation: Record<string, { name: string; qty: number }> = {};
    pendingOrders.forEach(order => {
      order.items.forEach(item => {
        const pId = item.productId;
        const pName = item.product?.name || 'Unknown Pickle';
        if (!aggregation[pId]) {
          aggregation[pId] = { name: pName, qty: 0 };
        }
        aggregation[pId].qty += item.quantity;
      });
    });

    setLoading(true);
    let successCount = 0;
    
    try {
      for (const [prodId, data] of Object.entries(aggregation)) {
        // Check if a target for this product already exists in current pending list to avoid duplicates
        const exists = kitchenTargets.some(t => t.productId === prodId && t.status !== 'packed');
        if (exists) continue;

        const res = await fetch('/api/admin/kitchen-targets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: prodId,
            productName: data.name,
            targetQuantity: data.qty,
            notes: 'Generated from pending orders',
            status: 'pending'
          })
        });

        if (res.ok) {
          const body = await res.json();
          setKitchenTargets(prev => [...prev, body.target]);
          successCount++;
        }
      }
      alert(`Successfully added ${successCount} daily targets from pending orders!`);
    } catch (error) {
      console.error('Error auto-generating targets', error);
      alert('Error auto-generating targets.');
    } finally {
      setLoading(false);
    }
  };

  // Operational metrics for the summary banner
  const totalTargetsCount = kitchenTargets.length;
  const packedTargetsCount = kitchenTargets.filter(t => t.status === 'packed').length;
  const pendingPackJars = kitchenTargets
    .filter(t => t.status !== 'packed')
    .reduce((sum, t) => sum + t.targetQuantity, 0);

  const completedPercentage = totalTargetsCount > 0 
    ? Math.round((packedTargetsCount / totalTargetsCount) * 100) 
    : 0;

  // Shortfall count calculation
  let shortfallCount = 0;
  kitchenTargets.forEach(target => {
    const matchingProd = products.find(p => p.id === target.productId);
    if (matchingProd && matchingProd.stockCount < target.targetQuantity && target.status !== 'packed') {
      shortfallCount++;
    }
  });

  return (
    <div className="admin-section">
      {/* Weather Alert Banner */}
      {weatherData && weatherData.daily && Math.max(...weatherData.daily.precipitation_sum) > 1.5 && (
        <div style={{
          backgroundColor: '#FFF5F5',
          border: '1px solid #FEB2B2',
          padding: '12px 20px',
          color: '#9B2C2C',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <span>⛈️</span>
          <div>
            <strong>Jaipur Weather Alert:</strong> High rainfall is forecast. Sun-drying times in the sun-process gallery will be delayed by ~{weatherData.daily.precipitation_sum.filter((p: number) => p > 1.5).length} days. Adjust batch start dates accordingly.
          </div>
        </div>
      )}

      {/* Operations Summary Panel Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        marginBottom: '24px',
        backgroundColor: '#FCF8F5',
        border: '1px solid var(--admin-border)',
        padding: '16px 20px',
      }}>
        <div style={{ borderRight: '1px solid var(--admin-border)', paddingRight: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--admin-muted)' }}>Jars left to pack</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--admin-maroon)', marginTop: '4px' }}>{pendingPackJars} jars</div>
        </div>

        <div style={{ borderRight: '1px solid var(--admin-border)', paddingRight: '10px', paddingLeft: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--admin-muted)' }}>Tasks Completed</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--admin-success)', marginTop: '4px' }}>{completedPercentage}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '2px' }}>{packedTargetsCount} of {totalTargetsCount} tasks done</div>
        </div>

        <div style={{ borderRight: '1px solid var(--admin-border)', paddingRight: '10px', paddingLeft: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--admin-muted)' }}>Stock Shortfalls</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: shortfallCount > 0 ? 'var(--admin-maroon)' : 'var(--admin-success)', marginTop: '4px' }}>
            {shortfallCount} items
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '2px' }}>needs kitchen prep cooking</div>
        </div>

        <div style={{ paddingLeft: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--admin-muted)' }}>Active Orders</span>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#555555', marginTop: '4px' }}>
            {orders.filter(o => ['NEW', 'CONFIRMED'].includes(o.status)).length} orders
          </div>
        </div>
      </div>

      {/* Kitchen Actions Header */}
      <div className="kitchen-header-bar">
        <div>
          <span className="kitchen-jump-link" onClick={() => setActiveTab('planner')}>
            📅 Jump to Production Planner &rarr;
          </span>
          <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
            Daily packing/prep checklist saved securely in the database.
          </p>
        </div>
        
        <button
          onClick={handleAutoPopulateTargets}
          disabled={loading}
          className="btn-submit-pickle"
          style={{ width: 'auto', padding: '12px 24px', margin: 0 }}
        >
          📥 Load Targets from Pending Orders
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Targets Cards Grid */}
        <div>
          {kitchenTargets.length === 0 ? (
            <div className="no-items-text">
              🍳 No prep targets added for today. Add a target on the right or load from pending orders.
            </div>
          ) : (
            <div className="kitchen-grid">
              {kitchenTargets.map(target => {
                // Find matching product in DB for live shelf stock check
                const matchingProd = products.find(p => p.id === target.productId);
                const isShortfall = matchingProd && matchingProd.stockCount < target.targetQuantity && target.status !== 'packed';
                const shortfallQty = matchingProd ? target.targetQuantity - matchingProd.stockCount : 0;
                
                return (
                  <div key={target.id} className={`kitchen-card status-${target.status}`} style={{
                    border: isShortfall ? '2px solid var(--admin-maroon)' : undefined,
                    boxShadow: isShortfall ? '0 4px 16px rgba(154, 44, 44, 0.12)' : undefined
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div className="kitchen-product-name">{target.productName}</div>
                        {matchingProd && (
                          <>
                            <div className="kitchen-stock-badge">
                              Shelf Stock: <strong>{matchingProd.stockCount} jars</strong> ({matchingProd.stockStatus})
                            </div>
                            <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--admin-muted)' }}>
                              Next Batch Target Date: <strong style={{ color: getBatchScheduleInfo(matchingProd).isClose ? 'var(--admin-maroon)' : 'inherit' }}>
                                {getBatchScheduleInfo(matchingProd).recommendedBatchDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </strong> (lead {getBatchScheduleInfo(matchingProd).totalLeadTime}d)
                            </div>
                          </>
                        )}
                      </div>

                      {/* Urgent Warning Shortfall Badge */}
                      {isShortfall && (
                        <span style={{
                          backgroundColor: 'var(--admin-maroon)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '4px 8px',
                          borderRadius: '2px',
                          textTransform: 'uppercase',
                          boxShadow: '0 2px 8px rgba(154, 44, 44, 0.3)'
                        }}>
                          ⚠️ Shortfall: -{shortfallQty} jars
                        </span>
                      )}
                    </div>

                    {/* Quantity Edit Section */}
                    <div className="kitchen-target-adjust">
                      <span className="kitchen-target-label">Target Jars:</span>
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQuantity(target.id, target.targetQuantity, -1)}
                        className="kitchen-adjust-btn"
                      >
                        -
                      </button>
                      <input 
                        type="number"
                        className="kitchen-quantity-input"
                        value={target.targetQuantity}
                        onChange={(e) => handleUpdateQuantity(target.id, 0, parseInt(e.target.value) || 0)}
                      />
                      <button 
                        type="button" 
                        onClick={() => handleUpdateQuantity(target.id, target.targetQuantity, 1)}
                        className="kitchen-adjust-btn"
                      >
                        +
                      </button>
                    </div>

                    {/* Notes Area */}
                    <div>
                      <textarea
                        className="kitchen-notes-area"
                        rows={2}
                        placeholder="Add prep notes (e.g. extra spice, double seal)..."
                        value={target.notes || ''}
                        onChange={(e) => setKitchenTargets(prev => prev.map(t => t.id === target.id ? { ...t, notes: e.target.value } : t))}
                        onBlur={(e) => handleUpdateNotes(target.id, e.target.value)}
                      />
                    </div>

                    {/* Status Select dropdown */}
                    <div>
                      <select
                        className={`kitchen-status-select ${target.status}`}
                        value={target.status}
                        onChange={(e) => handleUpdateStatus(target.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="ready">Ready</option>
                        <option value="packed">Packed</option>
                      </select>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleDeleteTarget(target.id)}
                      className="kitchen-delete-btn"
                    >
                      🗑️ Delete Target
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar target adder & Notepad form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Target Adder Card */}
          <div className="admin-premium-card" style={{ padding: '20px', margin: 0 }}>
            <h3 className="admin-card-title-lux" style={{ marginBottom: '16px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
              ➕ Add Prep Target
            </h3>
            
            <form onSubmit={handleAddTarget} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Select Product</label>
                <select
                  className="form-control"
                  value={newTargetProductId}
                  onChange={(e) => {
                    setNewTargetProductId(e.target.value);
                    if (e.target.value === '') {
                      setNewTargetName('');
                    }
                  }}
                >
                  <option value="">-- Custom Target Name --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {!newTargetProductId && (
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Custom Target Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Special Chili powder blend"
                    className="form-control"
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label>Target Quantity (Jars)</label>
                <input 
                  type="number"
                  className="form-control"
                  value={newTargetQuantity}
                  onChange={(e) => setNewTargetQuantity(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Prep Notes</label>
                <input 
                  type="text"
                  placeholder="e.g., Use small glass jars"
                  className="form-control"
                  value={newTargetNotes}
                  onChange={(e) => setNewTargetNotes(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-submit-pickle"
                style={{ margin: 0 }}
              >
                Add to Kitchen View
              </button>
            </form>
          </div>

          {/* Persistent general notes pad */}
          <div className="admin-premium-card" style={{ padding: '20px', margin: 0, backgroundColor: '#FFFDF9' }}>
            <h3 className="admin-card-title-lux" style={{ marginBottom: '10px', borderBottom: '1px solid var(--admin-border)', paddingBottom: '10px' }}>
              📝 Today&apos;s Kitchen Notes
            </h3>
            <p style={{ color: 'var(--admin-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
              General scratchpad for kitchen scheduling, staff duties, or reminders.
            </p>
            <textarea
              className="form-control"
              rows={8}
              value={generalNotes}
              onChange={(e) => saveGeneralNotes(e.target.value)}
              placeholder="Type cooking tasks, ingredients to buy, or notes..."
              style={{
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                lineHeight: '1.4',
                backgroundColor: 'transparent',
                border: '1px solid #E3D9C9',
                padding: '12px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
