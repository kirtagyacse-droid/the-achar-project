"use client";
import React from 'react';

interface FromKitchenProps {
  title?: string;
}

export function FromKitchenBlock({ title = "From Aunty's Kitchen" }: FromKitchenProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-accent-light)',
        border: '1px solid var(--border-light)',
        borderLeft: '4px solid var(--color-accent)',
        padding: '24px',
        margin: '32px 0',
        borderRadius: '0 8px 8px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>👩‍🍳</span>
        <h4
          className="heading-serif"
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-accent)',
            margin: 0,
          }}
        >
          {title}
        </h4>
      </div>
      <p
        style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          margin: 0,
          lineHeight: '1.6',
        }}
      >
        This story comes straight from our sun-drenched kitchen in Jaipur, where every
        batch is made with patience, love, and traditional wisdom passed down through
        generations.
      </p>
    </div>
  );
}