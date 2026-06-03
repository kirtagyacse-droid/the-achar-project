import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAuntyNotification } from '@/lib/whatsapp';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, phone, email, address, planJars, notes } = body;

    if (!customerName || !phone || !address || !planJars) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const nextDeliveryDate = new Date();
    nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 30); // 30 days from today

    const subscription = await prisma.subscription.create({
      data: {
        customerName,
        phone,
        email: email || null,
        address,
        planJars: parseInt(planJars, 10),
        notes: notes || null,
        isActive: true,
        nextDelivery: nextDeliveryDate,
      },
    });

    // Notify Aunty
    const message = `✨ New Achar Club Subscriber!\n👤 Name: ${customerName}\n📞 Phone: ${phone}\n📦 Plan: ${planJars} jars/month\n📍 Address: ${address}\n📝 Notes: ${notes || 'None'}`;
    await sendAuntyNotification(message);

    return NextResponse.json({ message: 'Subscribed successfully', subscription }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ message: 'Failed to subscribe' }, { status: 500 });
  }
}
