import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const data: Record<string, string | number | null> = {};
    if (body.targetQuantity !== undefined) data.targetQuantity = parseInt(body.targetQuantity) || 0;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.status !== undefined) data.status = body.status;
    if (body.productName !== undefined) data.productName = body.productName;

    const target = await prisma.kitchenTarget.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, target });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update kitchen target';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.kitchenTarget.delete({
      where: { id }
    });
    return NextResponse.json({ success: true, message: 'Kitchen target deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete kitchen target';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
