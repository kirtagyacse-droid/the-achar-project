import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAuntyNotification } from '@/lib/whatsapp';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { phone: phone.trim() },
      include: {
        dispatches: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ message: 'Failed to retrieve subscription' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      customerName, 
      phone, 
      email, 
      address, 
      planJars, 
      notes,
      planName,
      frequency,
      spicePreference,
      exclusions
    } = body;

    if (!customerName || !phone || !address || !planJars) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const nextDeliveryDate = new Date();
    nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 30); // 30 days from today

    const subscription = await prisma.$transaction(async (tx) => {
      // Create the subscription
      const sub = await tx.subscription.create({
        data: {
          customerName,
          phone: phone.trim(),
          email: email || null,
          address,
          planJars: parseInt(planJars, 10),
          notes: notes || null,
          isActive: true,
          nextDelivery: nextDeliveryDate,
          planName: planName || "Seasonal Discovery Box",
          frequency: frequency || "monthly",
          spicePreference: spicePreference || "Medium",
          exclusions: exclusions || null,
          status: "ACTIVE"
        },
      });

      // Create the first pending box dispatch
      const currentMonthName = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      await tx.subscriptionDispatch.create({
        data: {
          subscriptionId: sub.id,
          boxName: `${currentMonthName} Box`,
          status: 'PENDING',
          paymentMethod: 'COD',
          notes: 'First box reservation auto-generated'
        }
      });

      return sub;
    });

    // Notify Aunty
    const message = `✨ New Achar Club Subscriber!\n👤 Name: ${customerName}\n📞 Phone: ${phone}\n📦 Plan: ${planName || 'Seasonal Discovery'} (${planJars} jars/${frequency || 'monthly'})\n🌶️ Spice: ${spicePreference || 'Medium'}\n❌ Exclusions: ${exclusions || 'None'}\n📍 Address: ${address}`;
    await sendAuntyNotification(message);

    return NextResponse.json({ message: 'Subscribed successfully', subscription }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ message: 'Failed to subscribe' }, { status: 500 });
  }
}
