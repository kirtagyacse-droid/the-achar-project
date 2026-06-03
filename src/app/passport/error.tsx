'use client';
import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '600px' }}>
      <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>⚠️</span>
      <h2 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-accent)' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px', lineHeight: '1.6' }}>
        We encountered an error loading your loyalty details. Please try again.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button
          onClick={() => reset()}
          className="btn-lux-primary"
          style={{ margin: 0 }}
        >
          Try Again
        </button>
        <a href="/" className="btn-lux-secondary">
          Go Home
        </a>
      </div>
    </div>
  );
}
