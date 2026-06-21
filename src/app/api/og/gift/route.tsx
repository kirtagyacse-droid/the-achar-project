import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const occasion = searchParams.get('occasion') || 'Festive Celebration';
  const packaging = searchParams.get('packaging') || 'wooden-crate';
  const total = searchParams.get('total') || '0';

  const packagingLabel = packaging === 'wooden-crate' ? 'Premium Wooden Crate' : 'Cotton Wrap';
  const packagingEmoji = packaging === 'wooden-crate' ? '📦' : '🎁';

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
          padding: '40px 60px',
          position: 'relative',
        }}
      >
        {/* Decorative maroon pattern overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.04,
            background:
              'radial-gradient(circle at 50% 50%, #9A2C2C 40px, transparent 41px)',
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '20px',
          }}
        >
          🎉
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
          }}
        >
          Gift Box Ready
        </div>

        {/* Occasion */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: '30px',
          }}
        >
          {occasion}
        </div>

        {/* Packaging badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 36px',
            backgroundColor: '#FEFCBF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '32px' }}>{packagingEmoji}</span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#718096',
            }}
          >
            {packagingLabel}
          </span>
        </div>

        {/* Total */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#9A2C2C',
            marginBottom: '30px',
          }}
        >
          ₹{parseInt(total).toLocaleString('en-IN')}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '20px',
            color: '#718096',
            textAlign: 'center',
          }}
        >
          Premium Rajasthani pickle gift • Handcrafted with love
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