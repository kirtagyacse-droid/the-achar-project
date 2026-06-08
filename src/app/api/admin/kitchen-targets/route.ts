import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const targets = await prisma.kitchenTarget.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, targets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch kitchen targets';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { productId, productName, targetQuantity, notes, status } = await req.json();

    if (!productName) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    const target = await prisma.kitchenTarget.create({
      data: {
        productId: productId || null,
        productName,
        targetQuantity: parseInt(targetQuantity) || 0,
        notes: notes || null,
        status: status || 'pending'
      }
    });

    return NextResponse.json({ success: true, target });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create kitchen target';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
