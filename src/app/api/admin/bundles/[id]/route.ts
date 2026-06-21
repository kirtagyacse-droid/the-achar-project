import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, slug, description, coverImage, productIds, packagingStyle, isPublished, sortOrder } = body;

    const bundle = await prisma.festivalBundle.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(coverImage !== undefined && { coverImage }),
        ...(productIds && { productIds }),
        ...(packagingStyle && { packagingStyle }),
        ...(typeof isPublished === 'boolean' && { isPublished }),
        ...(sortOrder && { sortOrder })
      }
    });

    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error('Error updating bundle:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update bundle';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.festivalBundle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bundle:', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete bundle';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}