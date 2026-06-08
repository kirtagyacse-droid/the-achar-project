import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAuntyNotification } from '@/lib/whatsapp';

import { z } from 'zod';
import { applyRateLimit } from '@/lib/rateLimit';

const passportStampSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  productId: z.string().min(1, 'Product ID is required')
});

export async function POST(req: Request) {
  // Rate limiting: 20 stamp submissions per hour per IP
  const limitRes = await applyRateLimit('passport-stamp', 20, 60 * 60 * 1000);
  if (limitRes) return limitRes;

  try {
    const body = await req.json();
    const result = passportStampSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { phone, productId } = result.data;

    // Find the passport
    const passport = await prisma.picklePassport.findUnique({
      where: { phone },
    });

    if (!passport) {
      return NextResponse.json({ message: 'Passport not found. Please register/create a passport first.' }, { status: 404 });
    }

    // Find the product to confirm it exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Add stamp if not already present
    const updatedStamps = [...passport.stamps];
    if (!updatedStamps.includes(productId)) {
      updatedStamps.push(productId);
    }

    // Fetch all products to check if they have all been tried
    const allProducts = await prisma.product.findMany();
    const allProductIds = allProducts.map(p => p.id);
    
    // Check completion status
    const isAllStamped = allProductIds.every(id => updatedStamps.includes(id));
    
    let shouldNotify = false;
    let isCompleteNow = passport.isComplete;

    if (isAllStamped && !passport.isComplete) {
      isCompleteNow = true;
      shouldNotify = true;
    }

    const updatedPassport = await prisma.picklePassport.update({
      where: { phone },
      data: {
        stamps: updatedStamps,
        isComplete: isCompleteNow,
      },
    });

    if (shouldNotify) {
      const message = `🎉 Pickle Passport Completed!\n👤 Customer: ${passport.customerName}\n📞 Phone: ${phone}\n🫙 Status: All ${allProducts.length} pickles tried. Eligible for a free jar!`;
      await sendAuntyNotification(message);
    }

    return NextResponse.json({ 
      message: 'Product stamped successfully!', 
      passport: updatedPassport,
      newStampAdded: !passport.stamps.includes(productId),
      completedNow: shouldNotify
    }, { status: 200 });

  } catch (error) {
    console.error('Error stamping passport:', error);
    return NextResponse.json({ message: 'Failed to stamp passport' }, { status: 500 });
  }
}
