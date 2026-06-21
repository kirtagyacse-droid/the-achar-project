import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

const otpRequestSchema = z.object({
  orderId: z.string().uuid()
});

export async function POST(req: Request) {
  const headerList = await headers();
  const riderId = headerList.get('x-rider-id');

  if (!riderId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = otpRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const { orderId } = result.data;

    const assignment = await prisma.riderAssignment.findFirst({
      where: { riderId, orderId }
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = bcryptjs.hashSync(otp, 10);

    await prisma.deliveryOtp.create({
      data: {
        assignmentId: assignment.id,
        riderId,
        otpHash,
        otpPlain: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'OTP generated. In production, this would be sent via SMS.' 
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate OTP' }, { status: 500 });
  }
}