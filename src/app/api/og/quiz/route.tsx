import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const product = searchParams.get('product') || 'Keri Ka Khatta';
  const spice = searchParams.get('spice') || 'Medium';
  const profile = searchParams.get('profile') || 'Tangy & Sour';

  const spiceEmojis = {
    Sweet: '🌼',
    Mild: '🌶️',
    Medium: '🌶️🌶️',
    Hot: '🌶️🌶️🌶️',
  };

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
        {/* Decorative border accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '6px solid #9A2C2C',
            margin: '20px',
            opacity: 0.2,
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '20px',
          }}
        >
          ✨
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '42px',
            fontWeight: 800,
            color: '#9A2C2C',
            textAlign: 'center',
            marginBottom: '10px',
            letterSpacing: '-1px',
          }}
        >
          My Pickle Match
        </div>

        {/* Product name */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 700,
            color: '#1A1A1A',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          {product}
        </div>

        {/* Spice indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '24px',
              color: '#718096',
            }}
          >
            Spice Level:
          </span>
          <span
            style={{
              fontSize: '32px',
            }}
          >
            {spiceEmojis[spice as keyof typeof spiceEmojis] || '🌶️'}
          </span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#4A5568',
            }}
          >
            {spice}
          </span>
        </div>

        {/* Profile */}
        <div
          style={{
            fontSize: '20px',
            color: '#718096',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          Flavor Profile: {profile}
        </div>

        {/* Call to action */}
        <div
          style={{
            fontSize: '18px',
            color: '#9A2C2C',
            fontWeight: 600,
            letterSpacing: '1px',
          }}
        >
          Find Your Perfect Pickle • RS Savoury
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