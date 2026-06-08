import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

import { z } from 'zod';
import { applyRateLimit } from '@/lib/rateLimit';

const referralGenerateSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required')
});

export async function POST(req: Request) {
  // Rate limiting: 5 generations per hour per IP
  const limitRes = await applyRateLimit('referral-generate', 5, 60 * 60 * 1000);
  if (limitRes) return limitRes;

  try {
    const body = await req.json();
    const result = referralGenerateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { orderId } = result.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    
    // Check if referrer already has an active referral code
    const existingReferral = await prisma.referral.findFirst({
      where: { referrerPhone: cleanPhone }
    });

    if (existingReferral) {
      return NextResponse.json({ referralCode: existingReferral.referralCode }, { status: 200 });
    }

    // Generate new code: REF-[last4]-[random4]
    const last4 = cleanPhone.substring(Math.max(0, cleanPhone.length - 4)) || '0000';
    const random4 = Math.floor(1000 + Math.random() * 9000).toString();
    const referralCode = `REF-${last4}-${random4}`;

    await prisma.referral.create({
      data: {
        referrerPhone: cleanPhone,
        referrerName: order.customerName,
        referralCode,
        isUsed: false,
        referrerCredit: 0,
        refereeDiscount: 100
      }
    });

    return NextResponse.json({ referralCode }, { status: 201 });

  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json({ message: 'Failed to generate referral code' }, { status: 500 });
  }
}
