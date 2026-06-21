import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

const assignSchema = z.object({
  riderPhone: z.string().regex(/^\d{10}$/),
  orderId: z.string().uuid()
});

export async function POST(req: Request) {
  const headerList = await headers();
  const adminToken = headerList.get('authorization')?.replace('Bearer ', '');

  if (!adminToken || adminToken !== process.env.RIDER_ADMIN_TOKEN) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = assignSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const { riderPhone, orderId } = result.data;

    const rider = await prisma.rider.findUnique({ where: { phone: riderPhone, isActive: true } });
    if (!rider) {
      return NextResponse.json({ success: false, error: 'Rider not found' }, { status: 404 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const clusterKey = `${order.landmark || order.city || 'Unknown'} Cluster`;

    await prisma.riderAssignment.create({
      data: {
        riderId: rider.id,
        orderId,
        codAmount: order.totalAmount,
        clusterKey
      }
    });

    return NextResponse.json({ success: true, message: 'Order assigned to rider' });
  } catch (error) {
    console.error('Assign error:', error);
    return NextResponse.json({ success: false, error: 'Assignment failed' }, { status: 500 });
  }
}