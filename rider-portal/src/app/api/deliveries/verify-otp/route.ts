import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

const verifyOtpSchema = z.object({
  orderId: z.string().uuid(),
  otp: z.string().length(4).regex(/^\d{4}$/)
});

export async function POST(req: Request) {
  const headerList = await headers();
  const riderId = headerList.get('x-rider-id');

  if (!riderId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
    }

    const { orderId, otp } = result.data;

    const assignment = await prisma.riderAssignment.findFirst({
      where: { riderId, orderId },
      include: { otps: { orderBy: { requestedAt: 'desc' }, take: 1 } }
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.status !== 'ASSIGNED') {
      return NextResponse.json({ success: false, error: 'Delivery already processed' }, { status: 400 });
    }

    const latestOtp = assignment.otps[0];
    if (!latestOtp || latestOtp.used || latestOtp.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: 'OTP expired or already used' }, { status: 400 });
    }

    const isMatch = bcryptjs.compareSync(otp, latestOtp.otpHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
    }

    await prisma.deliveryOtp.update({
      where: { id: latestOtp.id },
      data: { used: true, verifiedAt: new Date() }
    });

    await prisma.riderAssignment.update({
      where: { id: assignment.id },
      data: { 
        status: 'DELIVERED', 
        deliveredAt: new Date(),
        codCollected: true
      }
    });

    await prisma.deliveryEvent.create({
      data: {
        riderId,
        assignmentId: assignment.id,
        eventType: 'DELIVERY_COMPLETED',
        note: 'OTP verified successfully'
      }
    });

    return NextResponse.json({ success: true, message: 'Delivery confirmed' });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}