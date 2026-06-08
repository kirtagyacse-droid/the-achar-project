"use client";
import React, { useState } from 'react';
import { Subscription } from '../AdminClient';

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
}

export default function SubscriptionsTab({ subscriptions, setSubscriptions }: SubscriptionsTabProps) {
  // Inner tabs: 'directory' | 'dispatches' | 'analytics'
  const [subTab, setSubTab] = useState<'directory' | 'dispatches' | 'analytics'>('directory');
  
  // Generation & Filter States
  const [newBoxName, setNewBoxName] = useState(() => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) + ' Box';
  });
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState('');
  
  // Filter for cycles
  const allDispatches = subscriptions.flatMap(s => (s.dispatches || []).map(d => ({ ...d, subscription: s })));
  const uniqueCycles = Array.from(new Set(allDispatches.map(d => d.boxName))).sort();
  const [selectedCycle, setSelectedCycle] = useState<string>(
    uniqueCycles.length > 0 ? uniqueCycles[uniqueCycles.length - 1] : new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) + ' Box'
  );

  // Dispatch Note Form State
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // 1. Status toggle for Subscriber
  const handleToggleSubStatus = async (subId: string, currentStatus: string, nextStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => {
    const confirmMsg = `Are you sure you want to change status from ${currentStatus} to ${nextStatus}?`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/subscribe/${subId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success && data.subscription) {
        setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, ...data.subscription } : s));
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating subscriber status');
    }
  };

  // 2. Batch generate upcoming cycle dispatches
  const handleGenerateDispatches = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoxName.trim()) return;

    setGenerating(true);
    setGenMessage('');

    try {
      const res = await fetch('/api/admin/subscriptions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxName: newBoxName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setGenMessage(`Success! Generated pending dispatches for ${data.createdCount} active subscribers.`);
        
        // Reload all subscriptions from page to refresh dispatches history
        window.location.reload();
      } else {
        alert(data.error || 'Failed to generate dispatches');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating dispatches');
    } finally {
      setGenerating(false);
    }
  };

  // 3. Update individual dispatch status
  const handleUpdateDispatchStatus = async (dispatchId: string, subscriptionId: string, nextStatus: string, notes?: string) => {
    try {
      const res = await fetch(`/api/admin/subscriptions/dispatches/${dispatchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, notes })
      });
      const data = await res.json();
      if (data.success && data.dispatch) {
        setSubscriptions(prev => prev.map(sub => {
          if (sub.id === subscriptionId) {
            const updatedDispatches = (sub.dispatches || []).map(d => d.id === dispatchId ? { ...d, ...data.dispatch } : d);
            return { ...sub, dispatches: updatedDispatches };
          }
          return sub;
        }));
        setEditingNotesId(null);
      } else {
        alert(data.error || 'Failed to update dispatch');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating dispatch status');
    }
  };

  // Calculations for analytics
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const pausedSubs = subscriptions.filter(s => s.status === 'PAUSED');
  const cancelledSubs = subscriptions.filter(s => s.status === 'CANCELLED');
  const totalActiveJars = activeSubs.reduce((sum, s) => sum + s.planJars, 0);
  const projectedMonthlyRevenue = totalActiveJars * 180; // Estimated ₹180 per jar

  // Plan distribution counts
  const planCounts = subscriptions.reduce((acc: Record<string, number>, s) => {
    if (s.status === 'ACTIVE') {
      acc[s.planName] = (acc[s.planName] || 0) + 1;
    }
    return acc;
  }, {});

  // Spice preference counts
  const spiceCounts = subscriptions.reduce((acc: Record<string, number>, s) => {
    if (s.status === 'ACTIVE') {
      acc[s.spicePreference] = (acc[s.spicePreference] || 0) + 1;
    }
    return acc;
  }, {});

  // Filtered dispatches for the selected cycle
  const filteredDispatches = allDispatches.filter(d => d.boxName === selectedCycle);

  return (
    <div className="admin-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tab controls */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', paddingBottom: '1px', gap: '20px' }}>
        <button 
          onClick={() => setSubTab('directory')} 
          style={{ 
            padding: '12px 20px', 
            fontSize: '1rem', 
            fontWeight: 600, 
            background: 'none', 
            border: 'none', 
            borderBottom: subTab === 'directory' ? '3px solid var(--admin-maroon)' : '3px solid transparent', 
            color: subTab === 'directory' ? 'var(--admin-maroon)' : 'var(--admin-muted)', 
            cursor: 'pointer' 
          }}
        >
          👥 Member Directory ({subscriptions.length})
        </button>
        <button 
          onClick={() => setSubTab('dispatches')} 
          style={{ 
            padding: '12px 20px', 
            fontSize: '1rem', 
            fontWeight: 600, 
            background: 'none', 
            border: 'none', 
            borderBottom: subTab === 'dispatches' ? '3px solid var(--admin-maroon)' : '3px solid transparent', 
            color: subTab === 'dispatches' ? 'var(--admin-maroon)' : 'var(--admin-muted)', 
            cursor: 'pointer' 
          }}
        >
          📦 Dispatch & Confirmations Dashboard
        </button>
        <button 
          onClick={() => setSubTab('analytics')} 
          style={{ 
            padding: '12px 20px', 
            fontSize: '1rem', 
            fontWeight: 600, 
            background: 'none', 
            border: 'none', 
            borderBottom: subTab === 'analytics' ? '3px solid var(--admin-maroon)' : '3px solid transparent', 
            color: subTab === 'analytics' ? 'var(--admin-maroon)' : 'var(--admin-muted)', 
            cursor: 'pointer' 
          }}
        >
          📈 Club Performance
        </button>
      </div>

      {/* DIRECTORY TAB */}
      {subTab === 'directory' && (
        <div className="admin-premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="admin-card-title-lux" style={{ margin: 0 }}>👥 Registered Achar Club Members</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>
              Active: <strong>{activeSubs.length}</strong> | Paused: <strong>{pausedSubs.length}</strong> | Cancelled: <strong>{cancelledSubs.length}</strong>
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <p style={{ color: 'var(--admin-muted)', padding: '30px', textAlign: 'center' }}>No club subscribers found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Member Details</th>
                    <th>Plan Selection</th>
                    <th>Customizer Prefs</th>
                    <th>Shipping Address</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(sub => (
                    <tr key={sub.id} style={{ opacity: sub.status !== 'ACTIVE' ? 0.7 : 1 }}>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--admin-text)' }}>{sub.customerName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                          📞 {sub.phone} {sub.email ? ` | ✉️ ${sub.email}` : ''}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{sub.planName}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                          {sub.planJars} jars / {sub.frequency}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          padding: '2px 6px',
                          borderRadius: '12px',
                          backgroundColor: sub.spicePreference === 'Hot' ? '#FED7D7' : sub.spicePreference === 'Sweet' ? '#C6F6D5' : '#E2E8F0',
                          color: sub.spicePreference === 'Hot' ? '#9B2C2C' : sub.spicePreference === 'Sweet' ? '#22543D' : '#4A5568'
                        }}>
                          Spice: {sub.spicePreference}
                        </span>
                        {sub.exclusions && (
                          <div style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: '6px', color: '#9B2C2C' }}>
                            Excl: {sub.exclusions}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '200px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {sub.address}
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 8px',
                          borderRadius: '2px',
                          backgroundColor: sub.status === 'ACTIVE' ? '#E6FFFA' : sub.status === 'PAUSED' ? '#FEFCBF' : '#EDF2F7',
                          color: sub.status === 'ACTIVE' ? '#006D5B' : sub.status === 'PAUSED' ? '#975A16' : '#4A5568'
                        }}>
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          {sub.status === 'ACTIVE' ? (
                            <button 
                              onClick={() => handleToggleSubStatus(sub.id, sub.status, 'PAUSED')}
                              className="admin-logout-btn" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0 }}
                            >
                              ⏸️ Pause
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleSubStatus(sub.id, sub.status, 'ACTIVE')}
                              className="admin-logout-btn" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0, borderColor: 'var(--admin-success)', color: 'var(--admin-success)' }}
                            >
                              ▶️ Resume
                            </button>
                          )}
                          {sub.status !== 'CANCELLED' && (
                            <button 
                              onClick={() => handleToggleSubStatus(sub.id, sub.status, 'CANCELLED')}
                              className="admin-logout-btn" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0, borderColor: '#FEB2B2', color: '#C53030' }}
                            >
                              ❌ Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DISPATCH CONTROL TAB */}
      {subTab === 'dispatches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Dispatch batch generator */}
          <div className="admin-premium-card">
            <h4 className="admin-card-title-lux" style={{ marginBottom: '12px' }}>⚙️ Batch Dispatch Generator</h4>
            <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
              Create pending delivery selections for the next billing cycle. The system will auto-schedule a COD pending record for all active members.
            </p>
            <form onSubmit={handleGenerateDispatches} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, margin: 0 }}>
                <label>Cycle Name (e.g. Month Year Box)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newBoxName}
                  onChange={e => setNewBoxName(e.target.value)}
                  placeholder="e.g. July 2026 Box"
                  style={{ padding: '10px' }}
                />
              </div>
              <button 
                type="submit" 
                className="admin-logout-btn" 
                style={{ padding: '10px 24px', margin: 0, backgroundColor: 'var(--admin-maroon)', color: 'white' }}
                disabled={generating}
              >
                {generating ? 'Generating...' : '🛠️ Generate Pending Box Dispatches'}
              </button>
            </form>
            {genMessage && (
              <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#2F855A', fontWeight: 600 }}>
                {genMessage}
              </div>
            )}
          </div>

          {/* Dispatch operations sheet */}
          <div className="admin-premium-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 className="admin-card-title-lux" style={{ margin: 0 }}>📦 COD Dispatch Confirmation Manager</h3>
                <span style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
                  Filter and track user confirmations, skips, packing states, and cash collection.
                </span>
              </div>
              
              {/* Cycle filter */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Cycle:</label>
                {uniqueCycles.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>No cycles active</span>
                ) : (
                  <select 
                    className="form-control" 
                    value={selectedCycle} 
                    onChange={e => setSelectedCycle(e.target.value)}
                    style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    {uniqueCycles.map(cycle => (
                      <option key={cycle} value={cycle}>{cycle}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {filteredDispatches.length === 0 ? (
              <p style={{ color: 'var(--admin-muted)', padding: '40px', textAlign: 'center' }}>
                No dispatches found for cycle: {selectedCycle}.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Subscriber</th>
                      <th>Curation Details</th>
                      <th>Custom Notes / Feedback</th>
                      <th>Cycle Status</th>
                      <th style={{ textAlign: 'right' }}>Update Dispatch State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDispatches.map(dispatch => (
                      <tr key={dispatch.id}>
                        <td>
                          <strong>{dispatch.subscription.customerName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', marginTop: '2px' }}>
                            📞 {dispatch.subscription.phone}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            {dispatch.subscription.planName} ({dispatch.subscription.planJars} jars)
                          </div>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            padding: '1px 5px', 
                            borderRadius: '8px', 
                            backgroundColor: '#EDF2F7',
                            color: '#4A5568',
                            display: 'inline-block',
                            marginTop: '4px'
                          }}>
                            🌶️ Pref: {dispatch.subscription.spicePreference}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', maxWidth: '220px', whiteSpace: 'normal' }}>
                          {editingNotesId === dispatch.id ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input 
                                type="text"
                                className="form-control" 
                                value={tempNotes}
                                onChange={e => setTempNotes(e.target.value)}
                                style={{ padding: '4px', fontSize: '0.8rem' }}
                              />
                              <button 
                                onClick={() => handleUpdateDispatchStatus(dispatch.id, dispatch.subscriptionId, dispatch.status, tempNotes)}
                                className="admin-logout-btn" 
                                style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: 'var(--admin-muted)' }}>
                                {dispatch.notes || 'No notes.'}
                              </span>
                              <button 
                                onClick={() => { setEditingNotesId(dispatch.id); setTempNotes(dispatch.notes || ''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--admin-maroon)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '2px',
                            backgroundColor: 
                              dispatch.status === 'DELIVERED' ? '#C6F6D5' :
                              dispatch.status === 'DISPATCHED' ? '#EBF8FF' :
                              dispatch.status === 'CONFIRMED' ? '#E6FFFA' :
                              dispatch.status === 'SKIPPED' ? '#FED7D7' : '#FEFCBF',
                            color: 
                              dispatch.status === 'DELIVERED' ? '#22543D' :
                              dispatch.status === 'DISPATCHED' ? '#2B6CB0' :
                              dispatch.status === 'CONFIRMED' ? '#006D5B' :
                              dispatch.status === 'SKIPPED' ? '#9B2C2C' : '#975A16'
                          }}>
                            {dispatch.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            {dispatch.status === 'PENDING' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateDispatchStatus(dispatch.id, dispatch.subscriptionId, 'SKIPPED')}
                                  className="admin-logout-btn" 
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0, borderColor: '#FEB2B2', color: '#C53030' }}
                                >
                                  Skip Box
                                </button>
                                <button 
                                  onClick={() => handleUpdateDispatchStatus(dispatch.id, dispatch.subscriptionId, 'CONFIRMED')}
                                  className="admin-logout-btn" 
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0, borderColor: 'var(--admin-success)', color: 'var(--admin-success)' }}
                                >
                                  Confirm Box
                                </button>
                              </>
                            )}
                            {dispatch.status === 'CONFIRMED' && (
                              <button 
                                onClick={() => handleUpdateDispatchStatus(dispatch.id, dispatch.subscriptionId, 'DISPATCHED')}
                                className="admin-logout-btn" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0, backgroundColor: '#EBF8FF', color: '#2B6CB0' }}
                              >
                                🚚 Mark Dispatched
                              </button>
                            )}
                            {dispatch.status === 'DISPATCHED' && (
                              <button 
                                onClick={() => handleUpdateDispatchStatus(dispatch.id, dispatch.subscriptionId, 'DELIVERED')}
                                className="admin-logout-btn" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0, backgroundColor: '#C6F6D5', color: '#22543D' }}
                              >
                                💰 Mark Delivered & Paid (COD)
                              </button>
                            )}
                            {dispatch.status === 'SKIPPED' && (
                              <button 
                                onClick={() => handleUpdateDispatchStatus(dispatch.id, dispatch.subscriptionId, 'PENDING')}
                                className="admin-logout-btn" 
                                style={{ padding: '4px 8px', fontSize: '0.75rem', margin: 0 }}
                              >
                                Undo Skip
                              </button>
                            )}
                            {dispatch.status === 'DELIVERED' && (
                              <span style={{ fontSize: '0.85rem', color: 'var(--admin-success)', fontWeight: 600 }}>
                                Paid & Fulfilled
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {subTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Counters Grid */}
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '20px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Active Members</span>
              <strong style={{ fontSize: '2.5rem', color: 'var(--admin-maroon)' }}>{activeSubs.length}</strong>
            </div>
            <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '20px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Jars Committed / Month</span>
              <strong style={{ fontSize: '2.5rem', color: 'var(--admin-text)' }}>{totalActiveJars} Jars</strong>
            </div>
            <div style={{ flex: 1, backgroundColor: '#FAFAFA', padding: '20px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--admin-border)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Projected MRR (₹180/jar)</span>
              <strong style={{ fontSize: '2.5rem', color: 'var(--admin-success)' }}>₹{projectedMonthlyRevenue.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Plan popularity */}
            <div className="admin-premium-card">
              <h4 className="admin-card-title-lux" style={{ marginBottom: '16px' }}>🌞 Plan Popularity Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(planCounts).map(([planName, count]) => {
                  const percentage = activeSubs.length > 0 ? Math.round((count / activeSubs.length) * 100) : 0;
                  return (
                    <div key={planName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span>{planName}</span>
                        <strong>{count} members ({percentage}%)</strong>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--admin-maroon)' }} />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(planCounts).length === 0 && (
                  <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No active plan splits available.</p>
                )}
              </div>
            </div>

            {/* Spice preference popularity */}
            <div className="admin-premium-card">
              <h4 className="admin-card-title-lux" style={{ marginBottom: '16px' }}>🌶️ Spice Preference Breakdown</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Sweet', 'Mild', 'Medium', 'Hot'].map(spice => {
                  const count = spiceCounts[spice] || 0;
                  const percentage = activeSubs.length > 0 ? Math.round((count / activeSubs.length) * 100) : 0;
                  return (
                    <div key={spice}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span>{spice} Preference</span>
                        <strong>{count} members ({percentage}%)</strong>
                      </div>
                      <div style={{ height: '8px', backgroundColor: 'var(--admin-border)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#DD6B20' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
