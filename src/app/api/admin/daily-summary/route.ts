import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Auth secret verification
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // In production, enforce cron secret. In dev, we can skip if not set or matches
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Define today's time range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's orders
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    const totalOrders = orders.length;
    const totalCOD = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Count by status groups
    // Pending: NEW, CONFIRMED, PACKED
    const pendingCount = orders.filter(o => ['NEW', 'CONFIRMED', 'PACKED'].includes(o.status)).length;
    const dispatchedCount = orders.filter(o => o.status === 'DISPATCHED').length;
    const deliveredCount = orders.filter(o => o.status === 'DELIVERED').length;

    // Fetch low stock items (< 15)
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stockCount: { lt: 15 }
      },
      select: {
        name: true,
        stockCount: true
      }
    });

    const lowStockText = lowStockProducts.length > 0 
      ? lowStockProducts.map(p => `${p.name} (${p.stockCount} left)`).join(', ')
      : "All stocked up!";

    const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Format WhatsApp message
    const message = `📦 RS Savoury — Daily Report ${dateStr}
Orders today: ${totalOrders} (₹${totalCOD} total)
Pending: ${pendingCount} | Dispatched: ${dispatchedCount} | Delivered: ${deliveredCount}
⚠️ Low stock: ${lowStockText}`;

    console.log("Daily summary message generated:\n", message);

    // Send WhatsApp notification via CallMeBot
    const phone = process.env.AUNTY_WHATSAPP_NUMBER || '919876543210'; // dummy fallback
    const apikey = process.env.CALLMEBOT_API_KEY;

    if (apikey) {
      try {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodedMessage}&apikey=${apikey}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error('CallMeBot returned error code during summary:', res.status, await res.text());
        } else {
          console.log('Daily summary alert sent successfully to', phone);
        }
      } catch (err) {
        console.error('Error contacting CallMeBot for daily summary:', err);
      }
    } else {
      console.log('Skipping WhatsApp summary: CALLMEBOT_API_KEY is not configured.');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Daily report processed', 
      stats: {
        totalOrders,
        totalCOD,
        pending: pendingCount,
        dispatched: dispatchedCount,
        delivered: deliveredCount,
        lowStockCount: lowStockProducts.length
      } 
    });
  } catch (error: any) {
    console.error('Daily summary route error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
