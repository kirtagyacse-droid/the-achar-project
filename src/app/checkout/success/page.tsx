"use client";
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [referralCode, setReferralCode] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (orderId) {
      fetch('/api/referral/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.referralCode) {
          setReferralCode(data.referralCode);
        }
      })
      .catch(err => console.error('Error generating referral:', err));
    }
  }, [orderId]);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://theacharproject.com';
  const shareText = `Hey! I've been ordering the most amazing homemade Rajasthani Achar from The Achar Project in Jaipur. Use my code ${referralCode} for ₹100 off your first order: ${siteUrl}`;
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
      <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--color-accent)' }}>
        Order Placed Successfully!
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Thank you for ordering from The Achar Project. We have received your order and will begin preparing it for dispatch soon!
      </p>
      
      {orderId && (
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', marginBottom: '30px' }}>
          <strong>Order Reference ID:</strong> <br />
          <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'var(--color-success)' }}>
            {orderId.substring(0, 8).toUpperCase()}
          </span>
        </div>
      )}
      
      <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>
        You will pay via Cash on Delivery when the package arrives at your doorstep.
      </p>

      {/* Refer a Friend Section */}
      {referralCode && (
        <div className="card" style={{ padding: '24px', border: '1px solid var(--border-light)', backgroundColor: 'var(--color-accent-light)', marginBottom: '40px', textAlign: 'center' }}>
          <h3 className="heading-serif" style={{ color: 'var(--color-accent)', marginBottom: '10px', fontSize: '1.4rem' }}>Refer a Friend</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '16px' }}>
            Give your friend ₹100 off their first order — you'll earn ₹100 credit too.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <span style={{ 
              fontFamily: 'monospace', 
              fontSize: '1.2rem', 
              fontWeight: 'bold', 
              letterSpacing: '0.05em',
              backgroundColor: 'white',
              border: '1px solid var(--border-medium)',
              padding: '8px 16px',
              color: 'var(--text-main)'
            }}>
              {referralCode}
            </span>
            <button 
              type="button" 
              onClick={copyToClipboard}
              className="btn-lux-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem', margin: 0, height: '40px' }}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          
          <a 
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp-order"
            style={{ display: 'inline-block', margin: 0, padding: '10px 20px', width: 'auto' }}
          >
            💬 Share Code on WhatsApp
          </a>
        </div>
      )}
      
      <Link href="/" className="btn-lux-primary">
        Return to Home
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>Loading...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
