"use client";
import React from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  description: string;
}

interface RelatedProductsProps {
  products: Product[];
  isLoading?: boolean;
}

export function RelatedProductsGrid({ products, isLoading }: RelatedProductsProps) {
  if (!products?.length && !isLoading) return null;

  return (
    <div style={{ margin: '40px 0', padding: '24px', backgroundColor: '#F9F9F9', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
      <h4
        className="heading-serif"
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-accent)',
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        🛒 Pickles Mentioned In This Story
      </h4>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: '160px', backgroundColor: 'var(--border-light)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {products.map(product => (
            <Link key={product.id} href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : 'none',
                    backgroundColor: product.imageUrl ? 'transparent' : '#E2E8F0',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    margin: '0 auto 12px',
                    border: '1px solid var(--border-light)',
                  }}
                />
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {product.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)' }}>
                  ₹{product.price}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}