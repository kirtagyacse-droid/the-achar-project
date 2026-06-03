import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || !token || token !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Alert ID is required' }, { status: 400 });
    }

    await prisma.festivalAlert.update({
      where: { id },
      data: { isDismissed: true }
    });

    return NextResponse.json({ success: true, message: 'Alert dismissed successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to dismiss alert' }, { status: 500 });
  }
}
