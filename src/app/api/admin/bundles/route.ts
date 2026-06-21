import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const bundles = await prisma.festivalBundle.findMany({
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json({ bundles });
  } catch (error) {
    console.error('Error fetching admin bundles:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch bundles';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, slug, description, coverImage, productIds, packagingStyle, isPublished, sortOrder } = await req.json();

    if (!name || !description || !productIds?.length) {
      return NextResponse.json({ success: false, error: 'Name, description, and productIds are required' }, { status: 400 });
    }

    // Auto-generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const bundle = await prisma.festivalBundle.create({
      data: {
        name,
        slug: finalSlug,
        description,
        coverImage: coverImage || null,
        productIds,
        packagingStyle: packagingStyle || 'cloth-wrap',
        isPublished: isPublished ?? true,
        sortOrder: sortOrder || 0
      }
    });

    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error('Error creating bundle:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create bundle';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}