import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const bundles = await prisma.festivalBundle.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' }
    });
    return NextResponse.json({ bundles });
  } catch (error) {
    console.error('Error fetching bundles:', error);
    const msg = error instanceof Error ? error.message : 'Failed to fetch bundles';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}