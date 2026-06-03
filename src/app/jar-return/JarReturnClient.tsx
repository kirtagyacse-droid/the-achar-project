"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function JarReturnPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    jarCount: 5,
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCode, setSuccessCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === 'jarCount' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/jar-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccessCode(data.discountCode);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (successCode) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>♻️</div>
        <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--color-accent)' }}>
          Request Submitted!
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', lineHeight: '1.6' }}>
          Aunty will contact you to coordinate the jar pickup. As a thank you, here is your 10% discount code for your next order:
        </p>
        
        <div style={{ 
          padding: '24px', 
          backgroundColor: 'var(--bg-secondary)', 
          border: '2px dashed var(--color-accent)', 
          marginBottom: '40px',
          borderRadius: '2px',
          display: 'inline-block'
        }}>
          <span style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--color-accent)' }}>
            {successCode}
          </span>
        </div>
        
        <div>
          <Link href="/products" className="btn-lux-primary">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '700px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{ fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 600 }}>
          SUSTAINABILITY
        </span>
        <h1 className="font-handwriting" style={{ fontSize: '4.5rem', margin: '10px 0 15px', color: 'var(--text-main)', lineHeight: 1.1 }}>
          Jar Return Program
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
          Help us close the loop. Return 5 or more empty martabans (jars) for a 10% discount on your next order.
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
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Number of Jars to Return *</label>
              <input required type="number" name="jarCount" min="5" className="form-control" style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid var(--border-medium)' }} value={formData.jarCount} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pickup Instructions / Notes (Optional)</label>
            <textarea name="notes" rows={2} className="form-control" style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid var(--border-medium)' }} placeholder="e.g. Best pickup time is weekends, or any specific instructions." value={formData.notes} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-lux-primary" style={{ width: '100%', padding: '16px', fontSize: '1rem', letterSpacing: '0.15em' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Register Return Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
