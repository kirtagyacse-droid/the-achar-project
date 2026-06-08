import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      status, 
      spicePreference, 
      exclusions, 
      planJars, 
      planName, 
      frequency, 
      address, 
      customerName, 
      email, 
      phone 
    } = body;

    const updateData: Prisma.SubscriptionUpdateInput = {};
    if (status !== undefined) {
      updateData.status = status;
      updateData.isActive = status === 'ACTIVE'; // Keep legacy compatibility
    }
    if (spicePreference !== undefined) updateData.spicePreference = spicePreference;
    if (exclusions !== undefined) updateData.exclusions = exclusions;
    if (planJars !== undefined) updateData.planJars = parseInt(planJars, 10);
    if (planName !== undefined) updateData.planName = planName;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (address !== undefined) updateData.address = address;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone.trim();

    const subscription = await prisma.subscription.update({
      where: { id },
      data: updateData,
      include: {
        dispatches: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update subscription';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
