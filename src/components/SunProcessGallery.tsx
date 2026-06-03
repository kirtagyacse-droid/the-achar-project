"use client";
import React from 'react';
import { PROCESS_GALLERY } from '@/lib/processGallery';

export default function SunProcessGallery() {
  // A set of beautiful unsplash food-craft fallback images in case local assets are missing
  const unsplashFallbacks = [
    'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=400&auto=format&fit=crop', // picking fruit
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop', // sun drying
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400&auto=format&fit=crop', // spices
    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop', // pressing oil
    'https://images.unsplash.com/photo-1536622432212-dbb67926b218?q=80&w=400&auto=format&fit=crop', // packing
    'https://images.unsplash.com/photo-1589135304905-6f66c343f2cd?q=80&w=400&auto=format&fit=crop', // sealed love
  ];

  return (
    <section className="process-gallery-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">OUR SUN-DRYING PROCESS</span>
          <h2 className="section-title font-handwriting" style={{ fontSize: '3rem', fontWeight: '500' }}>
            Made the Old Way
          </h2>
          <div className="section-divider"></div>
        </div>

        <div className="process-gallery-container">
          {PROCESS_GALLERY.map((slide, idx) => (
            <div key={idx} className="process-card-slide">
              <img 
                src={slide.imageUrl} 
                alt={slide.caption}
                onError={(e) => {
                  // Fallback for placeholder images
                  (e.target as HTMLImageElement).src = unsplashFallbacks[idx] || unsplashFallbacks[0];
                }}
              />
              <div className="process-card-overlay">
                <span className="process-card-caption">{slide.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
