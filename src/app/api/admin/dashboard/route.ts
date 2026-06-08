import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {

    const today = new Date();

    const activeAlerts = await prisma.festivalAlert.findMany({
      where: {
        alertDate: { lte: today },
        festivalDate: { gte: today },
        isDismissed: false
      }
    });

    const blogPosts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const passports = await prisma.picklePassport.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const jarReturns = await prisma.jarReturn.findMany({
      orderBy: { loggedAt: 'desc' }
    });

    const referrals = await prisma.referral.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      activeAlerts,
      blogPosts,
      orders,
      products,
      subscriptions,
      passports,
      jarReturns,
      referrals
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
