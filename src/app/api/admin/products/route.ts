import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, description, price, imageUrl, category, stockStatus, stockCount, batchNumber } = await req.json();

    if (!name || !description || price === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const initialStock = parseInt(stockCount, 10) || 0;

    // Use transaction to create product and log initial stock count
    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          imageUrl: imageUrl || '/placeholder.png',
          category: category || 'Pickle',
          stockStatus: stockStatus || (initialStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
          stockCount: initialStock,
          batchNumber: batchNumber || null,
          batchDate: batchNumber ? new Date() : null
        }
      });

      if (initialStock > 0) {
        await tx.stockAdjustment.create({
          data: {
            productId: prod.id,
            productName: prod.name,
            quantity: initialStock,
            reason: 'manual_audit',
            notes: 'Initial product stock count',
            batchNumber: batchNumber || null
          }
        });
      }

      return prod;
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create product';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
