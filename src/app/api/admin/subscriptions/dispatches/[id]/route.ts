import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, notes } = await req.json();

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updatedDispatch = await prisma.subscriptionDispatch.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined
      }
    });

    return NextResponse.json({ success: true, dispatch: updatedDispatch });
  } catch (error) {
    console.error('Error updating subscription dispatch:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update subscription dispatch';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
