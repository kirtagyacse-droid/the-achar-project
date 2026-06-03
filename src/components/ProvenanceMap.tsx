"use client";
import React from 'react';

export default function ProvenanceMap() {
  const points = [
    { name: 'Jodhpur Mangoes', x: 150, y: 160, labelOffset: { x: -10, y: -15 } },
    { name: 'Jaipur Garlic', x: 240, y: 140, labelOffset: { x: 10, y: -15 } },
    { name: 'Pushkar Chilis', x: 200, y: 180, labelOffset: { x: 10, y: 15 } },
    { name: 'Rajasthan Mustard Oil', x: 120, y: 220, labelOffset: { x: -20, y: 15 } },
    { name: 'Himalayan Rock Salt', x: 210, y: 60, labelOffset: { x: 10, y: -15 } },
  ];

  return (
    <section className="provenance-map-section">
      <div className="container">
        <div className="provenance-map-grid">
          {/* Map Image SVG */}
          <div className="provenance-map-visual">
            <svg 
              className="rajasthan-outline-svg" 
              viewBox="0 0 400 300"
              style={{ filter: 'drop-shadow(0px 8px 24px rgba(0, 0, 0, 0.04))' }}
            >
              {/* Hand-drawn style simplified Rajasthan border polygon */}
              <polygon
                points="190,30 240,40 280,60 320,110 340,160 350,200 310,240 250,270 180,260 110,230 60,180 70,120 130,60"
                fill="#FAF6EE"
                stroke="#7B1C1C"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeDasharray="400"
                style={{ strokeDashoffset: 0 }}
              />

              {/* Distant grid lines for vintage cartographic aesthetic */}
              <line x1="50" y1="0" x2="50" y2="300" stroke="rgba(123, 28, 28, 0.05)" strokeWidth="0.5" />
              <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(123, 28, 28, 0.05)" strokeWidth="0.5" />
              <line x1="250" y1="0" x2="250" y2="300" stroke="rgba(123, 28, 28, 0.05)" strokeWidth="0.5" />
              <line x1="350" y1="0" x2="350" y2="300" stroke="rgba(123, 28, 28, 0.05)" strokeWidth="0.5" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(123, 28, 28, 0.05)" strokeWidth="0.5" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(123, 28, 28, 0.05)" strokeWidth="0.5" />

              {/* Labeled points with pulsing dots */}
              {points.map((pt, idx) => {
                const labelX = pt.x + pt.labelOffset.x;
                const labelY = pt.y + pt.labelOffset.y;
                const paddingX = 8;
                const paddingY = 4;
                const textWidth = pt.name.length * 6; // approximate text width
                
                // Determine text anchor
                const textAnchor = pt.labelOffset.x > 0 ? 'start' : 'end';
                const rectX = textAnchor === 'start' ? labelX - paddingX : labelX - textWidth - paddingX;

                return (
                  <g key={idx}>
                    {/* Ring Pulse */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="8"
                      className="pulsing-point-ring"
                    />
                    
                    {/* Center point */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      className="pulsing-point"
                    />

                    {/* Label background card */}
                    <rect
                      x={rectX}
                      y={labelY - 9}
                      width={textWidth + paddingX * 2}
                      height="16"
                      rx="2"
                      className="map-label-bg"
                    />

                    {/* Label text */}
                    <text
                      x={labelX}
                      y={labelY + 2}
                      textAnchor={textAnchor}
                      className="map-label-text"
                    >
                      {pt.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Description Text block */}
          <div className="provenance-map-content">
            <span className="story-tag">PROVENANCE & ORIGIN</span>
            <h2 className="story-title" style={{ fontSize: '2.4rem', lineHeight: '1.2', marginBottom: '20px' }}>
              Sourced From the Heart of Rajasthan
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '16px' }}>
              We believe a great pickle begins with the soil. Every single mango, garlic pod, and fiery chili in our recipes is sourced directly from dedicated local farmers across Jodhpur, Jaipur, and Pushkar.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              Submerged in cold-pressed mustard oil and cured in traditional stone martabans, these ingredients mature under the warm sun, capturing the authentic desert terroir of Rajasthan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
