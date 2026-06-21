"use client";
import React, { useState } from 'react';
import Link from 'next/link';

interface SubscriptionDispatch {
  id: string;
  boxName: string;
  status: string;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
}

interface Subscription {
  id: string;
  customerName: string;
  phone: string;
  email: string | null;
  address: string;
  planName: string;
  planJars: number;
  frequency: string;
  spicePreference: string;
  exclusions: string | null;
  status: string;
  nextDelivery: string | null;
  dispatches: SubscriptionDispatch[];
}

export default function SubscribePage() {
  // Navigation tabs: 'landing' | 'join' | 'portal'
  const [activeView, setActiveView] = useState<'landing' | 'join' | 'portal'>('landing');

  // 1. Enrollment Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    planName: 'Seasonal Discovery Box',
    planJars: 2,
    frequency: 'monthly',
    spicePreference: 'Medium',
    exclusions: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 2. Portal State
  const [portalPhone, setPortalPhone] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');
  const [portalSub, setPortalSub] = useState<Subscription | null>(null);
  const [portalMessage, setPortalMessage] = useState('');

  // 3. Edit Preferences Form State (inside Portal)
  const [editSpice, setEditSpice] = useState('Medium');
  const [editExclusions, setEditExclusions] = useState('');
  const [editJars, setEditJars] = useState(2);
  const [updatingPrefs, setUpdatingPrefs] = useState(false);


  // Premium plans definition
  const plans = [
    {
      id: 'Seasonal Discovery Box',
      name: 'Seasonal Discovery Box',
      tagline: 'Aunty\'s Curated Selection',
      description: 'Experience the flow of seasons with a rotating selection of specials. Green raw mango in summer, kagzi lemons in winter, and rare sun-dried delicacies when in season.',
      jars: [2, 3, 4],
      icon: '🌞'
    },
    {
      id: 'Spice Lover Club',
      name: 'Spice Lover Club',
      tagline: 'For the Bold & Brave',
      description: 'Fiery, aromatic, and intense. A rotating choice of our spiciest pickles: teekhi green chili, double-spiced mango, and premium red chili loaded with home-ground masalas.',
      jars: [2, 3],
      icon: '🌶️'
    },
    {
      id: 'Family Pantry Plan',
      name: 'Family Pantry Plan',
      tagline: 'Household Staples',
      description: 'Mild, sweet-and-sour, and kid-friendly staples. Perfect for daily family lunches and dinners. Includes traditional khatta meetha lemon, mild garlic, and soft carrots.',
      jars: [3, 4],
      icon: '🥣'
    },
    {
      id: 'Festive Gift Club',
      name: 'Festive Gift Club',
      tagline: 'Celebration Bundles',
      description: 'Share the warmth of home. Jars are specially packaged in premium hand-loom cloth wraps or wooden crates, complete with custom handwritten greeting cards for family.',
      jars: [2, 4],
      icon: '🏮'
    }
  ];

  const handleEnrollChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.name === 'planJars' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to enroll');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit subscription request');
    } finally {
      setLoading(false);
    }
  };

  // Portal lookup handler
  const handlePortalLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalPhone) return;

    setPortalLoading(true);
    setPortalError('');
    setPortalMessage('');

    try {
      const res = await fetch(`/api/subscribe?phone=${encodeURIComponent(portalPhone)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Lookup failed');

      if (data.subscription) {
        setPortalSub(data.subscription);
        setEditSpice(data.subscription.spicePreference);
        setEditExclusions(data.subscription.exclusions || '');
        setEditJars(data.subscription.planJars);
      } else {
        setPortalSub(null);
        setPortalError('No active subscription found for this phone number. Would you like to join?');
      }
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Connection error. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  // Skip / Confirm Dispatch Handler
  const handleDispatchAction = async (dispatchId: string, action: 'confirm' | 'skip') => {
    if (!portalSub) return;
    setPortalLoading(true);
    setPortalError('');
    setPortalMessage('');

    try {
      const res = await fetch('/api/subscribe/dispatches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, action })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record choice');

      // Refresh subscription data
      const refreshRes = await fetch(`/api/subscribe?phone=${encodeURIComponent(portalSub.phone)}`);
      const refreshData = await refreshRes.json();
      if (refreshData.subscription) {
        setPortalSub(refreshData.subscription);
        setEditSpice(refreshData.subscription.spicePreference);
        setEditExclusions(refreshData.subscription.exclusions || '');
        setEditJars(refreshData.subscription.planJars);
        setPortalMessage(action === 'confirm' ? 'Box selection confirmed! Aunty is packing it.' : 'You have skipped this cycle. No delivery will occur.');
      }
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Failed to update selection');
    } finally {
      setPortalLoading(false);
    }
  };

  // Pause / Resume / Cancel subscription
  const handleSubscriptionStatus = async (newStatus: 'ACTIVE' | 'PAUSED' | 'CANCELLED') => {
    if (!portalSub) return;
    setPortalLoading(true);
    setPortalError('');
    setPortalMessage('');

    let confirmMsg = 'Are you sure you want to pause your membership?';
    if (newStatus === 'CANCELLED') confirmMsg = 'Are you sure you want to cancel your membership?';
    if (newStatus === 'ACTIVE') confirmMsg = 'Are you sure you want to resume your membership?';
    
    if (!confirm(confirmMsg)) {
      setPortalLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/subscribe/${portalSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change status');

      if (data.subscription) {
        setPortalSub(data.subscription);
        setEditSpice(data.subscription.spicePreference);
        setEditExclusions(data.subscription.exclusions || '');
        setEditJars(data.subscription.planJars);
        if (newStatus === 'ACTIVE') setPortalMessage('Welcome back! Your Achar Club membership is active again.');
        if (newStatus === 'PAUSED') setPortalMessage('Your membership has been paused. Resume anytime.');
        if (newStatus === 'CANCELLED') setPortalMessage('Your membership is cancelled. We will miss you!');
      }
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setPortalLoading(false);
    }
  };

  // Update preferences inside portal
  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalSub) return;
    setUpdatingPrefs(true);
    setPortalError('');
    setPortalMessage('');

    try {
      const res = await fetch(`/api/subscribe/${portalSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spicePreference: editSpice,
          exclusions: editExclusions,
          planJars: editJars
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update preferences');

      if (data.subscription) {
        setPortalSub(data.subscription);
        setEditSpice(data.subscription.spicePreference);
        setEditExclusions(data.subscription.exclusions || '');
        setEditJars(data.subscription.planJars);
        setPortalMessage('Preferences updated successfully!');
      }
    } catch (err) {
      setPortalError(err instanceof Error ? err.message : 'Failed to save preferences');
    } finally {
      setUpdatingPrefs(false);
    }
  };

  // Landing view rendering
  if (activeView === 'landing') {
    return (
      <div className="container" style={{ padding: '60px 24px', maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ fontSize: '0.95rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 700 }}>
            THE ACHAR CLUB MEMBERSHIP
          </span>
          <h1 className="font-handwriting" style={{ fontSize: '5rem', margin: '12px 0 15px', color: 'var(--text-main)', lineHeight: 1.1 }}>
            Artisanal Sun-Matured Pickles
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
            Join Jaipur’s premium culinary club. Curated box of home-made achars, aged to maturity and delivered regularly to your door. COD-friendly confirmations.
          </p>

          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button onClick={() => setActiveView('join')} className="btn-lux-primary" style={{ padding: '14px 32px' }}>
              Browse & Join the Club
            </button>
            <button onClick={() => setActiveView('portal')} className="btn-lux-secondary" style={{ padding: '14px 32px' }}>
              Manage My Membership
            </button>
          </div>
        </div>

        {/* Storytelling Grid */}
        <h3 className="heading-serif text-center" style={{ fontSize: '2.2rem', marginBottom: '32px', marginTop: '60px' }}>
          Choose Your Curation Plan
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          {plans.map(plan => (
            <div key={plan.id} className="card" style={{ padding: '30px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease' }}>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{plan.icon}</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {plan.tagline}
                </span>
                <h4 className="heading-serif" style={{ fontSize: '1.4rem', margin: '6px 0 12px' }}>{plan.name}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                  {plan.description}
                </p>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginBottom: '16px' }}>
                  Available sizes: <strong>{plan.jars.join(', ')} jars</strong> / dispatch
                </div>
                <button 
                  onClick={() => {
                    setFormData(prev => ({ ...prev, planName: plan.id }));
                    setActiveView('join');
                  }} 
                  className="btn-lux-secondary" 
                  style={{ width: '100%', margin: 0, padding: '8px' }}
                >
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

// Enrollment View
   if (activeView === 'join') {
    const handleShareSubscription = () => {
      const params = new URLSearchParams({
        name: formData.customerName.split(' ')[0] || 'Member',
        plan: formData.planName,
        months: '1',
        milestone: 'first'
      });
      const shareUrl = `${window.location.origin}/api/og/subscription?${params}`;
      if (navigator.share) {
        navigator.share({
          title: 'Achar Club Membership',
          text: `I just joined the RS Savoury Achar Club! ${formData.planName} curated pickles delivered monthly.`,
          url: shareUrl
        });
      } else {
        navigator.clipboard.writeText(shareUrl);
        alert('Share preview link copied to clipboard!');
      }
    };

    if (success) {
      return (
        <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✨</div>
          <h1 className="heading-serif" style={{ fontSize: '2.8rem', marginBottom: '20px', color: 'var(--color-accent)' }}>
            Welcome to the Club!
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '40px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
            Aunty will contact you shortly via phone/WhatsApp to confirm your first dispatch selection. We mature each jar under the Jaipur sun specifically for club members!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button
              onClick={handleShareSubscription}
              style={{
                padding: '12px 24px',
                fontSize: '0.9rem',
                backgroundColor: '#38A169',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              📱 Share My Membership
            </button>
            <Link href="/products" className="btn-lux-primary">Explore Products Menu</Link>
            <button onClick={() => { setSuccess(false); setActiveView('portal'); }} className="btn-lux-secondary">Go to My Portal</button>
          </div>
        </div>
      );
    }

    return (
      <div className="container" style={{ padding: '60px 24px', maxWidth: '750px' }}>
        <div style={{ marginBottom: '30px' }}>
          <span style={{ cursor: 'pointer', color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.9rem' }} onClick={() => setActiveView('landing')}>
            &larr; Back to plans
          </span>
          <h2 className="font-handwriting" style={{ fontSize: '4rem', margin: '10px 0 0', color: 'var(--text-main)' }}>
            Achar Club Enrollment
          </h2>
        </div>

        <div className="card" style={{ padding: '40px', border: '1px solid var(--border-light)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
          {error && (
            <div style={{ color: '#7B1C1C', marginBottom: '24px', padding: '12px', backgroundColor: 'var(--color-accent-light)', border: '1px solid rgba(123,28,28,0.15)', fontSize: '0.95rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Step 1: Select Plan */}
            <div className="form-group">
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. Select Curation Plan</label>
              <select 
                name="planName" 
                className="form-control" 
                value={formData.planName} 
                onChange={handleEnrollChange}
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Jar Count */}
            <div className="form-group">
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. Preferred Jars Count / Dispatch</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[2, 3, 4].map((num) => (
                  <label key={num} style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px',
                    border: formData.planJars === num ? '2px solid var(--color-accent)' : '1px solid var(--border-medium)',
                    backgroundColor: formData.planJars === num ? 'var(--color-accent-light)' : 'transparent',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    textAlign: 'center'
                  }}>
                    <input type="radio" name="planJars" value={num} checked={formData.planJars === num} onChange={handleEnrollChange} style={{ display: 'none' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{num} Jars</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {num === 2 ? 'Couple choice' : num === 3 ? 'Achar lovers' : 'Family pantry'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Step 3: Select Frequency & Spice preference */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>3. Delivery Frequency</label>
                <select name="frequency" className="form-control" value={formData.frequency} onChange={handleEnrollChange} style={{ width: '100%', padding: '12px' }}>
                  <option value="monthly">Every Month (Standard)</option>
                  <option value="bimonthly">Every 2 Months (Bi-monthly)</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>4. Spice Level Preference</label>
                <select name="spicePreference" className="form-control" value={formData.spicePreference} onChange={handleEnrollChange} style={{ width: '100%', padding: '12px' }}>
                  <option value="Sweet">Sweet & Sour (Meetha/Khatta)</option>
                  <option value="Mild">Mild Spiciness</option>
                  <option value="Medium">Medium MASALA (Standard)</option>
                  <option value="Hot">Spicy / Teekha</option>
                </select>
              </div>
            </div>

            {/* Step 4: Exclusions & Allergies */}
            <div className="form-group">
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>5. Dislikes / Exclusions</label>
              <textarea 
                name="exclusions" 
                rows={2} 
                className="form-control" 
                placeholder="e.g. No garlic, no onion, dislike lemon etc. (Leave blank if you love everything!)"
                value={formData.exclusions} 
                onChange={handleEnrollChange}
                style={{ width: '100%', padding: '10px' }}
              />
            </div>

            {/* Step 5: Contact Details */}
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '12px', fontSize: '0.9rem', color: 'var(--color-accent)', textTransform: 'uppercase' }}>6. Contact & Delivery Info</label>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <input required type="text" name="customerName" className="form-control" placeholder="Full Name" value={formData.customerName} onChange={handleEnrollChange} style={{ width: '100%', padding: '12px' }} />
              </div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                <input required type="tel" name="phone" className="form-control" placeholder="Phone Number" value={formData.phone} onChange={handleEnrollChange} style={{ flex: 1, padding: '12px' }} />
                <input type="email" name="email" className="form-control" placeholder="Email Address (Optional)" value={formData.email} onChange={handleEnrollChange} style={{ flex: 1, padding: '12px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '10px' }}>
                <textarea required name="address" rows={2} className="form-control" placeholder="Complete Shipping Address" value={formData.address} onChange={handleEnrollChange} style={{ width: '100%', padding: '12px' }} />
              </div>
            </div>

            <div style={{ backgroundColor: '#FAFAFA', padding: '16px', fontSize: '0.85rem', border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
              🔔 <strong>COD Reservation:</strong> No payment is required right now. Each cycle, we will contact you to confirm the dispatch. Upon delivery, pay Cash-on-Delivery (COD).
            </div>

            <button type="submit" className="btn-lux-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem', letterSpacing: '0.1em' }} disabled={loading}>
              {loading ? 'Registering...' : 'Join the Achar Club'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Self-Service Customer Portal View
  if (activeView === 'portal') {
    return (
      <div className="container" style={{ padding: '60px 24px', maxWidth: '850px' }}>
        <div style={{ marginBottom: '30px' }}>
          <span style={{ cursor: 'pointer', color: 'var(--color-accent)', fontWeight: 600, fontSize: '0.9rem' }} onClick={() => setActiveView('landing')}>
            &larr; Back to landing
          </span>
          <h2 className="font-handwriting" style={{ fontSize: '4rem', margin: '10px 0 0' }}>
            Member&apos;s Lounge
          </h2>
        </div>

        {/* 1. Phone number lookup form */}
        {!portalSub ? (
          <div className="card" style={{ padding: '40px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Verify Your Membership</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '450px', margin: '0 auto 24px', lineHeight: '1.5' }}>
              Enter your registered phone number below to access skip options, edit flavor preferences, or pause your box dispatches.
            </p>
            <form onSubmit={handlePortalLookup} style={{ display: 'flex', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
              <input 
                required 
                type="tel" 
                placeholder="Phone number (e.g. 9829012345)" 
                className="form-control" 
                value={portalPhone}
                onChange={e => setPortalPhone(e.target.value)}
                style={{ flex: 1, padding: '12px' }}
              />
              <button type="submit" className="btn-lux-primary" style={{ margin: 0, padding: '12px 24px' }} disabled={portalLoading}>
                {portalLoading ? 'Verifying...' : 'Access Lounge'}
              </button>
            </form>
            {portalError && (
              <div style={{ marginTop: '20px', color: '#7B1C1C', fontSize: '0.9rem', backgroundColor: 'var(--color-accent-light)', padding: '10px', border: '1px solid rgba(123,28,28,0.1)' }}>
                {portalError}
              </div>
            )}
          </div>
        ) : (
          /* 2. Customer subscription panel active */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header Status Card */}
            <div className="card" style={{ padding: '30px', border: '1px solid var(--border-light)', borderLeft: `6px solid ${portalSub.status === 'ACTIVE' ? 'var(--color-accent)' : '#A1A1AA'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Member Profile</span>
                  <h3 className="heading-serif" style={{ fontSize: '1.8rem', margin: '4px 0' }}>{portalSub.customerName}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                    Phone: {portalSub.phone} {portalSub.email ? ` | Email: ${portalSub.email}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ 
                    backgroundColor: portalSub.status === 'ACTIVE' ? 'var(--color-accent-light)' : '#F4F4F5', 
                    color: portalSub.status === 'ACTIVE' ? 'var(--color-accent)' : '#71717A',
                    padding: '4px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderRadius: '2px',
                    border: `1px solid ${portalSub.status === 'ACTIVE' ? 'rgba(123,28,28,0.1)' : '#E4E4E7'}`
                  }}>
                    {portalSub.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Plan: <strong>{portalSub.planName}</strong> ({portalSub.planJars} jars / {portalSub.frequency})
                  </span>
                </div>
              </div>

              {portalMessage && (
                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', border: '1px solid rgba(27,94,32,0.1)', fontSize: '0.9rem' }}>
                  {portalMessage}
                </div>
              )}
            </div>

            {/* Upcoming Box Controls */}
            {portalSub.status === 'ACTIVE' && (
              <div className="card" style={{ padding: '30px', border: '1px solid var(--border-light)', backgroundColor: '#FCF8F5' }}>
                <h4 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '8px' }}>📦 Next Upcoming Box Selection</h4>
                
                {/* Look for first pending/confirmed dispatch in history */}
                {(() => {
                  const upcoming = portalSub.dispatches.find(d => d.status === 'PENDING' || d.status === 'CONFIRMED');
                  if (!upcoming) {
                    return (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                        Your upcoming selection cycle has not been scheduled yet. Aunty will generate the next monthly box schedule soon!
                      </p>
                    );
                  }

                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', padding: '16px 20px', border: '1px solid var(--border-light)', margin: '16px 0' }}>
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{upcoming.boxName}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Status: <strong style={{ color: upcoming.status === 'CONFIRMED' ? 'var(--color-success)' : 'var(--color-accent)' }}>{upcoming.status}</strong>
                          </div>
                        </div>

                        {upcoming.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              onClick={() => handleDispatchAction(upcoming.id, 'skip')}
                              className="btn-lux-secondary" 
                              style={{ margin: 0, padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Skip This Cycle
                            </button>
                            <button 
                              onClick={() => handleDispatchAction(upcoming.id, 'confirm')}
                              className="btn-lux-primary" 
                              style={{ margin: 0, padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Confirm Selection
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--color-success)', fontWeight: 600 }}>
                              ✓ Selection Confirmed
                            </span>
                            <button 
                              onClick={() => handleDispatchAction(upcoming.id, 'skip')}
                              style={{ background: 'none', border: 'none', color: 'var(--color-accent)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '16px' }}
                            >
                              Change to Skip
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                        💡 <strong>COD Confirmation:</strong> Confirming this box lets Aunty know she can prepare and bottle your jars. You will pay COD when the rider delivers.
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Customizations & Preferences update */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              
              {/* Preferences Form */}
              <div className="card" style={{ padding: '30px', border: '1px solid var(--border-light)' }}>
                <h4 className="heading-serif" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>⚙️ Customization Preferences</h4>
                
                <form onSubmit={handleUpdatePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Preferred Jars per Month</label>
                    <select className="form-control" value={editJars} onChange={e => setEditJars(parseInt(e.target.value, 10))} style={{ width: '100%', padding: '10px' }}>
                      <option value={2}>2 Jars</option>
                      <option value={3}>3 Jars</option>
                      <option value={4}>4 Jars</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Spice Level preference</label>
                    <select className="form-control" value={editSpice} onChange={e => setEditSpice(e.target.value)} style={{ width: '100%', padding: '10px' }}>
                      <option value="Sweet">Sweet & Sour (Meetha/Khatta)</option>
                      <option value="Mild">Mild Spiciness</option>
                      <option value="Medium">Medium MASALA (Standard)</option>
                      <option value="Hot">Spicy / Teekha</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Dislikes / Exclusions</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      value={editExclusions}
                      onChange={e => setEditExclusions(e.target.value)}
                      placeholder="e.g. No garlic, no onion, dislike lemon etc."
                      style={{ width: '100%', padding: '10px' }}
                    />
                  </div>

                  <button type="submit" className="btn-lux-primary" style={{ width: '100%', padding: '10px' }} disabled={updatingPrefs}>
                    {updatingPrefs ? 'Updating...' : 'Save Preferences'}
                  </button>
                </form>
              </div>

              {/* Pause / Skip membership control box */}
              <div className="card" style={{ padding: '30px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 className="heading-serif" style={{ fontSize: '1.25rem' }}>🛡️ Membership Controls</h4>
                
                <div>
                  <h5 style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.95rem' }}>Pause Membership</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 10px' }}>
                    Going on holiday? Pause your dispatches and reactivate them anytime without loosing preference settings.
                  </p>
                  {portalSub.status === 'ACTIVE' ? (
                    <button 
                      onClick={() => handleSubscriptionStatus('PAUSED')}
                      className="btn-lux-secondary" 
                      style={{ width: '100%', margin: 0, padding: '8px' }}
                    >
                      Pause Membership
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSubscriptionStatus('ACTIVE')}
                      className="btn-lux-primary" 
                      style={{ width: '100%', margin: 0, padding: '8px', backgroundColor: '#2B6CB0' }}
                    >
                      Resume Membership
                    </button>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px' }}>
                  <h5 style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.95rem', color: '#9B2C2C' }}>Cancel Membership</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.4', margin: '0 0 10px' }}>
                    We would be sad to see you go. Cancel your enrollment. You can always sign back up later.
                  </p>
                  {portalSub.status !== 'CANCELLED' && (
                    <button 
                      onClick={() => handleSubscriptionStatus('CANCELLED')}
                      className="btn-lux-secondary" 
                      style={{ width: '100%', margin: 0, padding: '8px', color: '#C53030', borderColor: '#FEB2B2' }}
                    >
                      Cancel Membership
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button 
              onClick={() => { setPortalSub(null); setPortalPhone(''); }} 
              className="btn-lux-secondary" 
              style={{ padding: '8px 24px', margin: '10px auto 0' }}
            >
              Exit Lounge Session
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
