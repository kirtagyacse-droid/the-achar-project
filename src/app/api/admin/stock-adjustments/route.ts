import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const adjustments = await prisma.stockAdjustment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        product: {
          select: {
            name: true,
            imageUrl: true,
          }
        }
      }
    });

    return NextResponse.json({ success: true, adjustments });
  } catch (error) {
    console.error('Error fetching stock adjustments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock adjustments' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { productId, quantity, reason, notes, batchNumber } = await req.json();

    if (!productId || quantity === undefined || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const change = parseInt(quantity, 10);
    if (isNaN(change)) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be a valid integer' },
        { status: 400 }
      );
    }

    // 1. Fetch the product to verify existence and get details
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // 2. Calculate new stock
    const newStockCount = Math.max(0, product.stockCount + change);

    // 3. Atomically update product and create stock adjustment in a transaction
    const [updatedProduct, adjustment] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: {
          stockCount: newStockCount,
          stockStatus: newStockCount > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
          // If a new batch is cooked, we optionally update product batch info
          ...(reason === 'batch_cooked' && batchNumber ? {
            batchNumber,
            batchDate: new Date()
          } : {})
        }
      }),
      prisma.stockAdjustment.create({
        data: {
          productId,
          productName: product.name,
          quantity: change,
          reason,
          notes: notes || null,
          batchNumber: batchNumber || null
        },
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      adjustment
    });
  } catch (error) {
    console.error('Error creating stock adjustment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stock adjustment' },
      { status: 500 }
    );
  }
}
