import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

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
