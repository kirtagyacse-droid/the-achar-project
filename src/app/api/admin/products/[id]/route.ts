import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    const updateData: {
      name?: string;
      description?: string;
      price?: number;
      imageUrl?: string;
      category?: string;
      stockStatus?: string;
      stockCount?: number;
      batchNumber?: string;
      batchDate?: Date;
    } = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.stockStatus !== undefined) updateData.stockStatus = data.stockStatus;
    if (data.batchNumber !== undefined) updateData.batchNumber = data.batchNumber;
    if (data.batchDate !== undefined) updateData.batchDate = data.batchDate ? new Date(data.batchDate) : undefined;

    // Handle stock Count updates with logging
    if (data.stockCount !== undefined) {
      const newStock = parseInt(data.stockCount, 10);
      updateData.stockCount = newStock;
      updateData.stockStatus = newStock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK';

      // Get current product to log change
      const product = await prisma.product.findUnique({
        where: { id }
      });

      if (product && product.stockCount !== newStock) {
        const diff = newStock - product.stockCount;
        
        // Use transaction to update product and create adjustment log
        const [updatedProduct] = await prisma.$transaction([
          prisma.product.update({
            where: { id },
            data: updateData
          }),
          prisma.stockAdjustment.create({
            data: {
              productId: id,
              productName: product.name,
              quantity: diff,
              reason: data.reason || 'manual_audit',
              notes: data.notes || 'Manual stock update',
              batchNumber: data.batchNumber || product.batchNumber || null
            }
          })
        ]);

        return NextResponse.json({ success: true, product: updatedProduct });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    const msg = error instanceof Error ? error.message : 'Failed to update product';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    const msg = error instanceof Error ? error.message : 'Failed to delete product';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
