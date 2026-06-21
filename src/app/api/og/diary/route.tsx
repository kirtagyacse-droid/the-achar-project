import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || "Aunty's Diary";

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #FCF8F5 0%, #F9F5F0 100%)',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Decorative border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '6px solid #9A2C2C',
            margin: '20px',
            opacity: 0.15,
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '20px',
          }}
        >
          📖
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#9A2C2C',
            textAlign: 'center',
            marginBottom: '10px',
            letterSpacing: '-1px',
            lineHeight: '1.2',
          }}
        >
          {title}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '24px',
            color: '#4A5568',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          Stories from the Kitchen • RS Savoury
        </div>

        {/* Decorative pickle icons row */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            fontSize: '36px',
          }}
        >
          <span>🥒</span>
          <span>🌶️</span>
          <span>🍋</span>
          <span>🧄</span>
        </div>

        {/* Brand watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            fontSize: '18px',
            color: '#9A2C2C',
            fontWeight: 600,
            letterSpacing: '2px',
          }}
        >
          RS SAVOURY • JAIPUR
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await fetch(
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
          ).then((res) => res.arrayBuffer()),
          style: 'normal',
        },
      ],
    },
  );
}