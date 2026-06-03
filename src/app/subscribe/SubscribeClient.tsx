"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SubscribePage() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    planJars: 2,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.name === 'planJars' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit subscription request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>✨</div>
        <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--color-accent)' }}>
          You're in!
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '40px', lineHeight: '1.6' }}>
          Aunty will be in touch within 24 hours to confirm your first delivery date. Get ready for fresh, sun-matured jars of achar delivered monthly!
        </p>
        <Link href="/products" className="btn-lux-primary">
          Explore the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '700px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{ fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 600 }}>
          THE ACHAR CLUB
        </span>
        <h1 className="font-handwriting" style={{ fontSize: '4.5rem', margin: '10px 0 15px', color: 'var(--text-main)', lineHeight: 1.1 }}>
          Join the Achar Club
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>
          Fresh jars of Aunty's achar, delivered to your door every month. Never run out again.
        </p>
      </div>

      <div className="card" style={{ padding: '40px', border: '1px solid var(--border-light)', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
        {error && (
          <div style={{ color: '#7B1C1C', marginBottom: '24px', padding: '12px', backgroundColor: 'var(--color-accent-light)', border: '1px solid rgba(123,28,28,0.15)', borderRadius: '2px', fontSize: '0.95rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name *</label>
            <input required type="text" name="customerName" className="form-control" style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid var(--border-medium)' }} value={formData.customerName} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number *</label>
              <input required type="tel" name="phone" className="form-control" style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid var(--border-medium)' }} value={formData.phone} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address (Optional)</label>
              <input type="email" name="email" className="form-control" style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid var(--border-medium)' }} value={formData.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Address *</label>
            <textarea required name="address" rows={3} className="form-control" style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid var(--border-medium)', resize: 'vertical' }} value={formData.address} onChange={handleChange} />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Jars per Month *</label>
            <div style={{ display: 'flex', gap: '16px' }}>
              {[2, 3, 4].map((num) => (
                <label key={num} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px',
                  border: formData.planJars === num ? '2px solid var(--color-accent)' : '1px solid var(--border-medium)',
                  backgroundColor: formData.planJars === num ? 'var(--color-accent-light)' : 'transparent',
                  cursor: 'pointer',
                  borderRadius: '2px',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}>
                  <input type="radio" name="planJars" value={num} checked={formData.planJars === num} onChange={handleChange} style={{ display: 'none' }} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: formData.planJars === num ? 'var(--color-accent)' : 'var(--text-main)' }}>{num} Jars</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {num === 2 ? 'Couple Choice' : num === 3 ? 'Achar Lovers' : 'Big Family Pack'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aunty, Please Note (Preferences/Allergies)</label>
            <textarea name="notes" rows={2} className="form-control" style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid var(--border-medium)' }} placeholder="e.g. Please include extra garlic mango or spicy mirch!" value={formData.notes} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-lux-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem', letterSpacing: '0.15em' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Join the Achar Club'}
          </button>
        </form>
      </div>
    </div>
  );
}
