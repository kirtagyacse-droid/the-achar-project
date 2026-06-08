import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Alert ID is required' }, { status: 400 });
    }

    await prisma.festivalAlert.update({
      where: { id },
      data: { isDismissed: true }
    });

    return NextResponse.json({ success: true, message: 'Alert dismissed successfully' });
  } catch (error) {
    console.error('Error dismissing alert:', error);
    const msg = error instanceof Error ? error.message : 'Failed to dismiss alert';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
