"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  imageUrl: string | null;
}

interface Passport {
  phone: string;
  customerName: string;
  stamps: string[];
  isComplete: boolean;
  freeJarClaimed: boolean;
}

export default function PassportPage() {
  const [phoneInput, setPhoneInput] = useState('');
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [passport, setPassport] = useState<Passport | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searched, setSearched] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch initial list of products so we can show the stamp board preview
  useEffect(() => {
    fetch('/api/passport?phone=dummy')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setProducts(data.products);
        }
      })
      .catch(err => console.error('Error fetching initial products:', err));
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return;
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch(`/api/passport?phone=${encodeURIComponent(phoneInput)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lookup failed');
      }

      if (data.passport) {
        setPassport(data.passport);
        setShowCreateForm(false);
      } else {
        setPassport(null);
        setShowCreateForm(true);
      }
      setProducts(data.products || []);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || 'Failed to find passport');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePassport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || !customerNameInput) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInput,
          customerName: customerNameInput
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create passport');
      }

      setPassport(data.passport);
      setShowCreateForm(false);
      setMessage('Your Pickle Passport has been created! Start earning stamps.');
    } catch (err: any) {
      setError(err.message || 'Failed to create passport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '900px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span style={{ fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 600 }}>
          LOYALTY PROGRAM
        </span>
        <h1 className="font-handwriting" style={{ fontSize: '4.5rem', margin: '10px 0 15px', color: 'var(--text-main)', lineHeight: 1.1 }}>
          Pickle Passport
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Try all of Aunty's pickles, earn a stamp for each one, and complete your Pickle Passport for a free jar of your choice.
        </p>
      </div>

      {/* Phone Lookup Section */}
      <div className="card" style={{ padding: '30px', marginBottom: '40px', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
        <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Find My Passport</h3>
        
        <form onSubmit={handleLookup} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input 
              required 
              type="tel" 
              placeholder="Enter your phone number (e.g. 9829012345)" 
              className="form-control"
              value={phoneInput}
              onChange={e => setPhoneInput(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', fontSize: '1rem' }}
            />
          </div>
          <button type="submit" className="btn-lux-primary" style={{ margin: 0, padding: '12px 24px' }} disabled={loading}>
            {loading ? 'Searching...' : 'Look Up'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: '20px', color: '#7B1C1C', padding: '10px', backgroundColor: 'var(--color-accent-light)', border: '1px solid rgba(123,28,28,0.1)', borderRadius: '2px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ marginTop: '20px', color: 'var(--color-success)', padding: '10px', backgroundColor: 'var(--color-success-light)', border: '1px solid rgba(27,94,32,0.1)', borderRadius: '2px', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        {/* Passport Not Found: Create Form */}
        {showCreateForm && (
          <div style={{ marginTop: '30px', padding: '24px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '2px', animation: 'fadeInOverlay 0.3s ease' }}>
            <h4 className="heading-serif" style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--color-accent)' }}>No Passport Found</h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              We couldn't find a Pickle Passport under that phone number. Enter your name below to register and start stamping!
            </p>
            <form onSubmit={handleCreatePassport} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Your Name</label>
                <input 
                  required 
                  type="text" 
                  className="form-control"
                  value={customerNameInput}
                  onChange={e => setCustomerNameInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px' }}
                />
              </div>
              <button type="submit" className="btn-lux-secondary" style={{ margin: 0, padding: '10px 20px', height: '42px' }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Passport'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Stamp Board Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
          <h3 className="heading-serif" style={{ fontSize: '1.8rem' }}>
            {passport ? `${passport.customerName}'s Stamp Board` : 'Your Stamp Board'}
          </h3>
          {passport && (
            <span style={{ fontSize: '1rem', color: 'var(--color-accent)', fontWeight: 600 }}>
              {passport.stamps.length} of {products.length} Stamped
            </span>
          )}
        </div>

        {passport?.isComplete && (
          <div style={{ 
            marginBottom: '30px', 
            padding: '24px', 
            backgroundColor: 'var(--color-accent-light)', 
            border: '2px dashed var(--color-accent)', 
            textAlign: 'center', 
            borderRadius: '2px'
          }}>
            <h3 className="font-handwriting" style={{ fontSize: '3rem', color: 'var(--color-accent)', marginBottom: '8px' }}>Passport Completed! 🎉</h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)' }}>
              {passport.freeJarClaimed 
                ? "You have claimed your free jar of choice! Thank you for trying all of Aunty's pickles." 
                : "You have completed your passport! Show this page to Aunty to claim your free jar of choice."}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '24px' }}>
          {products.map((product) => {
            const isStamped = passport ? passport.stamps.includes(product.id) : false;
            
            return (
              <div 
                key={product.id}
                style={{
                  position: 'relative',
                  border: isStamped ? '1px solid var(--border-medium)' : '1px dashed var(--border-medium)',
                  padding: '16px',
                  textAlign: 'center',
                  backgroundColor: isStamped ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  opacity: isStamped ? 1 : 0.6,
                  transition: 'all 0.3s ease',
                  borderRadius: '2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                {/* Product Image Slot */}
                <div 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundImage: `url(${product.imageUrl || '/placeholder.png'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: isStamped ? 'none' : 'grayscale(100%)',
                    marginBottom: '16px',
                    border: '1px solid var(--border-light)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Stamped Maroon Circular Overlay */}
                  {isStamped && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(123, 28, 28, 0.45)', // Deep maroon with opacity
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        borderRadius: '50%',
                        animation: 'fadeInOverlay 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', lineHeight: 1.3 }}>
                  {product.name}
                </span>

                {isStamped ? (
                  <span style={{ 
                    marginTop: '8px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'var(--color-accent)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em' 
                  }}>
                    ● Stamped
                  </span>
                ) : (
                  <span style={{ 
                    marginTop: '8px', 
                    fontSize: '0.75rem', 
                    color: 'var(--text-muted)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em' 
                  }}>
                    Unstamped
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
