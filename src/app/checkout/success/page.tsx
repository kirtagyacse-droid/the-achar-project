"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="container" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '600px' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
      <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--color-accent)' }}>
        Order Placed Successfully!
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
        Thank you for ordering from The Achar Project. We have received your order and will begin preparing it for dispatch soon!
      </p>
      
      {orderId && (
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', marginBottom: '40px' }}>
          <strong>Order Reference ID:</strong> <br />
          <span style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'var(--color-success)' }}>
            {orderId.substring(0, 8).toUpperCase()}
          </span>
        </div>
      )}
      
      <p style={{ marginBottom: '40px', color: 'var(--text-muted)' }}>
        You will pay via Cash on Delivery when the package arrives at your doorstep.
      </p>
      
      <Link href="/" className="btn-primary">
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
