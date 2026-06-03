import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone is required' }, { status: 400 });
    }

    const updated = await prisma.picklePassport.update({
      where: { phone },
      data: { freeJarClaimed: true }
    });

    return NextResponse.json({ message: 'Free jar claimed status updated successfully', passport: updated }, { status: 200 });

  } catch (error) {
    console.error('Error claiming free jar:', error);
    return NextResponse.json({ success: false, error: 'Failed to update claim status' }, { status: 500 });
  }
}
