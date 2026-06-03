import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    const passport = await prisma.picklePassport.findUnique({
      where: { phone },
    });

    // Also return list of all products so the client knows what stamp slots to render
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    if (!passport) {
      return NextResponse.json({ passport: null, products }, { status: 200 });
    }

    return NextResponse.json({ passport, products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching passport:', error);
    return NextResponse.json({ message: 'Failed to fetch passport' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, customerName } = body;

    if (!phone || !customerName) {
      return NextResponse.json({ message: 'Phone and Name are required' }, { status: 400 });
    }

    // Check if already exists
    const existing = await prisma.picklePassport.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json({ message: 'Passport already exists for this phone number', passport: existing }, { status: 200 });
    }

    const passport = await prisma.picklePassport.create({
      data: {
        phone,
        customerName,
        stamps: [],
        isComplete: false,
        freeJarClaimed: false,
      },
    });

    return NextResponse.json({ message: 'Passport created successfully', passport }, { status: 201 });
  } catch (error) {
    console.error('Error creating passport:', error);
    return NextResponse.json({ message: 'Failed to create passport' }, { status: 500 });
  }
}
