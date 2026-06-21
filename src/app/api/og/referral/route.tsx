import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') || 'XXXXXXXX';
  const discount = searchParams.get('discount') || '₹100';
  const used = searchParams.get('used') === 'true';

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
          background: 'linear-gradient(135deg, #FFF8F0 0%, #FFF5ED 100%)',
          padding: '40px 60px',
          position: 'relative',
        }}
      >
        {/* Decorative pattern - subtle maroon circles */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            background:
              'radial-gradient(circle at 100px 100px, #9A2C2C 12px, transparent 13px), radial-gradient(circle at 1100px 530px, #9A2C2C 16px, transparent 17px)',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '20px',
          }}
        >
          🎁
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
          Referral Achievement
        </div>

        {/* Code badge */}
        <div
          style={{
            padding: '16px 40px',
            backgroundColor: '#9A2C2C',
            borderRadius: '8px',
            marginBottom: '30px',
          }}
        >
          <span
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '4px',
            }}
          >
            {code}
          </span>
        </div>

        {/* Discount badge */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: used ? '#A0AEC0' : '#22543D',
            marginBottom: '20px',
          }}
        >
          {used ? '✓ Already Redeemed' : `${discount} Off`}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '20px',
            color: '#718096',
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          Share the love of handcrafted Rajasthani pickles • RS Savoury
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