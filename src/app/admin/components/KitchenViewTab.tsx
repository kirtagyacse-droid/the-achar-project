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

  return (
    <div className="admin-section">
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
                
                return (
                  <div key={target.id} className={`kitchen-card status-${target.status}`}>
                    <div>
                      <div className="kitchen-product-name">{target.productName}</div>
                      {matchingProd && (
                        <div className="kitchen-stock-badge">
                          Shelf Stock: <strong>{matchingProd.stockCount} jars</strong> ({matchingProd.stockStatus})
                        </div>
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

        {/* Sidebar target adder form */}
        <div className="admin-premium-card" style={{ padding: '20px' }}>
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
      </div>
    </div>
  );
}
