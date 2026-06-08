import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { dispatchId, action } = await req.json();

    if (!dispatchId || !action) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    if (action !== 'confirm' && action !== 'skip') {
      return NextResponse.json({ success: false, error: 'Invalid action. Must be "confirm" or "skip"' }, { status: 400 });
    }

    const nextStatus = action === 'confirm' ? 'CONFIRMED' : 'SKIPPED';

    const updatedDispatch = await prisma.subscriptionDispatch.update({
      where: { id: dispatchId },
      data: {
        status: nextStatus,
        notes: `Action logged by customer on ${new Date().toLocaleDateString('en-IN')}`
      }
    });

    return NextResponse.json({ success: true, dispatch: updatedDispatch });
  } catch (error) {
    console.error('Error updating dispatch:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update dispatch';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
