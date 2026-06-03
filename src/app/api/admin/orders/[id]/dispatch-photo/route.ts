import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { put } from '@vercel/blob';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || !token || token !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Upload to Vercel Blob
    const fileName = `dispatch_${id}_${Date.now()}_${file.name}`;
    const blob = await put(fileName, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    // Save URL to order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { dispatchPhotoUrl: blob.url },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to upload dispatch photo' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || !token || token !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Remove photo from order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { dispatchPhotoUrl: null },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to remove dispatch photo' }, { status: 500 });
  }
}
