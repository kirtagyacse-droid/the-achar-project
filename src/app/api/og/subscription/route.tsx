import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name') || 'Member';
  const plan = searchParams.get('plan') || 'Seasonal Discovery Box';
  const months = searchParams.get('months') || '1';
  const milestone = searchParams.get('milestone') || 'first';

  const milestoneLabels = {
    first: '🎉 First Box!',
    quarterly: '🏆 3 Months!',
    yearly: '👑 1 Year!',
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
        {/* Decorative jar silhouette */}
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: '80px',
            width: '120px',
            height: '160px',
            border: '4px solid #9A2C2C',
            borderRadius: '60px 60px 10px 10px',
            opacity: 0.1,
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '20px',
          }}
        >
          📦
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
          Achar Club Milestone
        </div>

        {/* Member name */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: '20px',
          }}
        >
          {name} • {plan}
        </div>

        {/* Milestone badge */}
        <div
          style={{
            padding: '16px 36px',
            backgroundColor: '#9A2C2C',
            borderRadius: '50px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {milestoneLabels[milestone as keyof typeof milestoneLabels] || 'Milestone'}
          </span>
        </div>

        {/* Stats */}
        <div
          style={{
            fontSize: '22px',
            color: '#4A5568',
            marginBottom: '30px',
          }}
        >
          {months} {parseInt(months) === 1 ? 'Month' : 'Months'} of Artisanal Love
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '18px',
            color: '#718096',
            textAlign: 'center',
          }}
        >
          Handcrafted pickles delivered monthly • Cash on Delivery
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