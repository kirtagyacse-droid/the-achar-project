"use client";
import React from 'react';

export interface JarSize {
  label: string;
  weightG: number;
  price: number;
}

interface JarSizeSelectorProps {
  sizes: JarSize[] | any;
  selectedSize: string;
  onSizeSelect: (size: JarSize) => void;
}

export default function JarSizeSelector({ sizes, selectedSize, onSizeSelect }: JarSizeSelectorProps) {
  // Parse sizes if they are stored as JSON/string or already an array
  let parsedSizes: JarSize[] = [];
  if (Array.isArray(sizes)) {
    parsedSizes = sizes;
  } else if (typeof sizes === 'string') {
    try {
      parsedSizes = JSON.parse(sizes);
    } catch (e) {
      parsedSizes = [];
    }
  }

  if (!parsedSizes || parsedSizes.length === 0) return null;

  // Find the selected size to calculate unit price per 100g
  const currentSizeDetails = parsedSizes.find(s => s.label === selectedSize) || parsedSizes[0];
  const pricePer100g = currentSizeDetails 
    ? ((currentSizeDetails.price / currentSizeDetails.weightG) * 100).toFixed(2)
    : null;

  return (
    <div className="jar-size-selector-wrap" style={{ margin: '16px 0' }}>
      <label className="edit-control-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Select Jar Size:
      </label>
      <div className="jar-size-pills" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {parsedSizes.map((size) => {
          const isSelected = size.label === selectedSize;
          return (
            <button
              key={size.label}
              type="button"
              onClick={() => onSizeSelect(size)}
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                fontWeight: '600',
                border: isSelected ? '2px solid #7B1C1C' : '1px solid var(--border-medium)',
                backgroundColor: isSelected ? 'rgba(123, 28, 28, 0.08)' : 'var(--bg-primary)',
                color: isSelected ? '#7B1C1C' : 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {size.label} · ₹{size.price}
            </button>
          );
        })}
      </div>
      {pricePer100g && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px', fontStyle: 'italic' }}>
          ₹{pricePer100g} per 100g
        </span>
      )}
    </div>
  );
}
