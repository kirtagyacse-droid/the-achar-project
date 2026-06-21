import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

const failSchema = z.object({
  orderId: z.string().uuid(),
  reason: z.enum(['UNREACHABLE', 'ADDRESS_ISSUE', 'NO_ANSWER', 'RESCHEDULE', 'COD_ISSUE', 'OTHER']),
  note: z.string().optional()
});

export async function POST(req: Request) {
  const headerList = await headers();
  const riderId = headerList.get('x-rider-id');

  if (!riderId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = failSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
    }

    const { orderId, reason, note } = result.data;

    const assignment = await prisma.riderAssignment.findFirst({
      where: { riderId, orderId }
    });

    if (!assignment) {
      return NextResponse.json({ success: false, error: 'Assignment not found' }, { status: 404 });
    }

    if (assignment.status !== 'ASSIGNED') {
      return NextResponse.json({ success: false, error: 'Delivery already processed' }, { status: 400 });
    }

    await prisma.riderAssignment.update({
      where: { id: assignment.id },
      data: { 
        status: 'FAILED', 
        failedReason: reason,
        failureNote: note
      }
    });

    await prisma.deliveryEvent.create({
      data: {
        riderId,
        assignmentId: assignment.id,
        eventType: 'DELIVERY_FAILED',
        note: `${reason}${note ? ': ' + note : ''}`
      }
    });

    return NextResponse.json({ success: true, message: 'Delivery marked as failed' });
  } catch (error) {
    console.error('Fail delivery error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
  }
}