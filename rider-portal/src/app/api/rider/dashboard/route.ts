import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET(req: Request) {
  const riderId = req.headers.get('x-rider-id');
  
  console.log('Dashboard API Hit:');
  console.log('x-rider-id from req.headers:', riderId);

  if (!riderId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const assignments = await prisma.riderAssignment.findMany({
      where: {
        riderId,
        assignedAt: { gte: today, lt: tomorrow }
      },
      include: {
        events: { orderBy: { createdAt: 'desc' } },
        order: { select: { customerName: true, phone: true, address: true, landmark: true } }
      },
      orderBy: { assignedAt: 'asc' }
    });

    const pending = assignments.filter(a => a.status === 'ASSIGNED');
    const completed = assignments.filter(a => a.status === 'DELIVERED');

    const totalCod = pending.reduce((sum, a) => sum + (a.codAmount || 0), 0);

    const byCluster = assignments.reduce((acc: Record<string, number>, a) => {
      const key = a.clusterKey || 'Uncategorized';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const rider = await prisma.rider.findUnique({ where: { id: riderId }, select: { isOnline: true } });

    return NextResponse.json({
      success: true,
      summary: {
        total: assignments.length,
        pending: pending.length,
        completed: completed.length,
        totalCodToCollect: totalCod
      },
      isOnline: rider?.isOnline || false,
      clusters: Object.entries(byCluster).map(([name, count]) => ({ name, count })),
      assignments
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load dashboard' }, { status: 500 });
  }
}