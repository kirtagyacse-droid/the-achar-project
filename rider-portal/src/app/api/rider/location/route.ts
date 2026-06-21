import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const riderId = headersList.get('x-rider-id');

    if (!riderId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lat, lng } = await req.json();

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    await prisma.rider.update({
      where: { id: riderId },
      data: {
        currentLat: lat,
        currentLng: lng,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Location update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const headersList = await headers();
    const riderId = headersList.get('x-rider-id');

    if (!riderId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isOnline } = await req.json();

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedRider = await prisma.rider.update({
      where: { id: riderId },
      data: {
        isOnline,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({ success: true, isOnline: updatedRider.isOnline });
  } catch (error) {
    console.error('Status toggle error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
