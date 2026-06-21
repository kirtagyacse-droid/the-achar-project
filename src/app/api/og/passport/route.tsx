import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const stamps = searchParams.get('stamps') || '0';
  const total = searchParams.get('total') || '6';
  const name = searchParams.get('name') || 'My';
  const completed = searchParams.get('completed') === 'true';

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
        {/* Decorative border */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '8px solid #9A2C2C',
            margin: '20px',
            opacity: 0.3,
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '20px',
          }}
        >
          🎴
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
          Pickle Passport
        </div>

        {/* Progress */}
        <div
          style={{
            fontSize: '24px',
            color: '#4A5568',
            marginBottom: '30px',
          }}
        >
          {name}&apos;s Progress: {stamps} / {total} Stamps
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '300px',
            height: '20px',
            backgroundColor: '#E2E8F0',
            borderRadius: '10px',
            overflow: 'hidden',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, (parseInt(stamps) / parseInt(total)) * 100)}%`,
              height: '100%',
              backgroundColor: '#9A2C2C',
              transition: 'width 0.3s',
            }}
          />
        </div>

        {/* Completion status */}
        {completed ? (
          <div
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#22543D',
              textAlign: 'center',
            }}
          >
            🏆 Passport Complete! Free Jar Earned
          </div>
        ) : (
          <div
            style={{
              fontSize: '20px',
              color: '#718096',
              textAlign: 'center',
            }}
          >
            Taste all flavors &bull; Earn rewards &bull; Join Aunty&apos;s club
          </div>
        )}

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