import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  const headerList = await headers();
  const riderId = headerList.get('x-rider-id');

  if (!riderId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID required' }, { status: 400 });
    }

    const assignment = await prisma.riderAssignment.findFirst({
      where: { riderId, orderId },
      include: {
        order: true,
        events: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    const otps = await prisma.deliveryOtp.findMany({
      where: { assignmentId: assignment.id },
      orderBy: { requestedAt: 'desc' },
      take: 3
    });

    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        otps
      }
    });
  } catch (error) {
    console.error('Assignment fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load assignment' }, { status: 500 });
  }
}