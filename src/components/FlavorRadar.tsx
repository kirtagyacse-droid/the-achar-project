"use client";
import React from 'react';

interface FlavorProfile {
  tangy: number;
  spicy: number;
  sweet: number;
  savory: number;
  salty: number;
}

interface FlavorRadarProps {
  profile: FlavorProfile | any;
}

export default function FlavorRadar({ profile }: FlavorRadarProps) {
  // Ensure profile properties exist with fallback defaults (0-5)
  const defaultProfile = { tangy: 0, spicy: 0, sweet: 0, savory: 0, salty: 0 };
  
  let scores = defaultProfile;
  if (profile) {
    try {
      scores = typeof profile === 'string' ? JSON.parse(profile) : profile;
    } catch (e) {
      scores = defaultProfile;
    }
  }

  // Ensure all keys exist and are capped between 0 and 5
  const activeScores = {
    tangy: Math.min(5, Math.max(0, scores.tangy ?? 0)),
    spicy: Math.min(5, Math.max(0, scores.spicy ?? 0)),
    sweet: Math.min(5, Math.max(0, scores.sweet ?? 0)),
    savory: Math.min(5, Math.max(0, scores.savory ?? 0)),
    salty: Math.min(5, Math.max(0, scores.salty ?? 0)),
  };

  // Dimensions of SVG container
  const size = 160;
  const center = size / 2; // 80
  const maxRadius = 52;

  // Ordered axes: Tangy, Spicy, Sweet, Savory, Salty
  const axes = [
    { name: 'Tangy', key: 'tangy' as const, angle: -Math.PI / 2 },
    { name: 'Spicy', key: 'spicy' as const, angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { name: 'Sweet', key: 'sweet' as const, angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { name: 'Savory', key: 'savory' as const, angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { name: 'Salty', key: 'salty' as const, angle: -Math.PI / 2 + (8 * Math.PI) / 5 },
  ];

  // Helper to compute (x, y) coordinates for a given axis and score level
  const getCoordinates = (angle: number, score: number) => {
    const radius = (score / 5) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // 1. Draw Concentric Background Grid Pentagons (Levels 1 to 5)
  const gridPentagons = [1, 2, 3, 4, 5].map((level) => {
    const points = axes.map((axis) => {
      const { x, y } = getCoordinates(axis.angle, level);
      return `${x},${y}`;
    }).join(' ');
    return points;
  });

  // 2. Draw the Score Polygon
  const scorePoints = axes.map((axis) => {
    const scoreVal = activeScores[axis.key];
    const { x, y } = getCoordinates(axis.angle, scoreVal);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div 
      className="flavor-radar-wrap"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        border: '1px solid var(--border-light)',
        backgroundColor: 'var(--bg-secondary)',
        width: 'fit-content',
        margin: '16px 0'
      }}
    >
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
        Flavor Profile
      </span>
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Concentric grid lines */}
        {gridPentagons.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="var(--border-medium)"
            strokeWidth="0.8"
          />
        ))}

        {/* Axis lines from center to outer edge */}
        {axes.map((axis, idx) => {
          const outerPoint = getCoordinates(axis.angle, 5);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke="var(--border-medium)"
              strokeWidth="0.8"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Labels at outer edges */}
        {axes.map((axis, idx) => {
          // Push labels slightly further than outer radius
          const labelDist = maxRadius + 14;
          const lx = center + labelDist * Math.cos(axis.angle);
          const ly = center + labelDist * Math.sin(axis.angle);
          
          let textAnchor: 'start' | 'end' | 'middle' = 'middle';
          if (Math.cos(axis.angle) > 0.1) textAnchor = 'start';
          else if (Math.cos(axis.angle) < -0.1) textAnchor = 'end';

          // Shift labels slightly to prevent vertical alignment overlap
          const yShift = axis.angle === -Math.PI / 2 ? -2 : (axis.angle === Math.PI / 2 ? 10 : 3);

          return (
            <text
              key={idx}
              x={lx}
              y={ly + yShift}
              textAnchor={textAnchor}
              fontSize="10"
              fontWeight="600"
              fill="var(--text-muted)"
              letterSpacing="0.02em"
              style={{ textTransform: 'uppercase' }}
            >
              {axis.name}
            </text>
          );
        })}

        {/* Filled polygon for actual scores */}
        <polygon
          points={scorePoints}
          fill="rgba(123, 28, 28, 0.25)"
          stroke="#7B1C1C"
          strokeWidth="1.8"
        />

        {/* Data points dots */}
        {axes.map((axis, idx) => {
          const scoreVal = activeScores[axis.key];
          if (scoreVal === 0) return null;
          const { x, y } = getCoordinates(axis.angle, scoreVal);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="3"
              fill="#7B1C1C"
            />
          );
        })}
      </svg>
      
      <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '8px', textAlign: 'center' }}>
        Scored by Aunty on a scale of 1–5.
      </span>
    </div>
  );
}
