"use client";
import React from 'react';

interface TastingNotesProps {
  notes: string;
  productName?: string;
}

export function TastingNotesBlock({ notes, productName }: TastingNotesProps) {
  return (
    <div
      style={{
        backgroundColor: '#FEFCBF',
        border: '1px solid #FBD38D',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>🍷</span>
        <h4
          className="heading-serif"
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#975A16',
            margin: 0,
          }}
        >
          Tasting Notes
          {productName && (
            <span style={{ fontWeight: 400, fontSize: '0.9rem', marginLeft: '8px' }}>
              — {productName}
            </span>
          )}
        </h4>
      </div>
      <blockquote
        style={{
          margin: 0,
          paddingLeft: '20px',
          borderLeft: '3px solid #DD6B20',
          fontStyle: 'italic',
          color: '#74431F',
          fontSize: '1rem',
          lineHeight: '1.7',
        }}
      >
        &ldquo;{notes}&rdquo;
      </blockquote>
    </div>
  );
}