import prisma from '@/lib/prisma';
import AdminClient from './AdminClient';

export const revalidate = 0; // Dynamic page

export default async function AdminDashboard() {
  // Seed FestivalAlerts if empty
  const alertsCount = await prisma.festivalAlert.count();
  if (alertsCount === 0) {
    await prisma.festivalAlert.createMany({
      data: [
        { name: "Holi 2026", festivalDate: new Date("2026-03-14"), alertDate: new Date("2026-02-21") },
        { name: "Eid 2026", festivalDate: new Date("2026-03-31"), alertDate: new Date("2026-03-14") },
        { name: "Diwali 2026", festivalDate: new Date("2026-10-20"), alertDate: new Date("2026-09-29") },
        { name: "Rakhi 2026", festivalDate: new Date("2026-08-09"), alertDate: new Date("2026-07-26") },
        
        { name: "Holi 2027", festivalDate: new Date("2027-03-03"), alertDate: new Date("2027-02-10") },
        { name: "Eid 2027", festivalDate: new Date("2027-03-10"), alertDate: new Date("2027-02-17") },
        { name: "Rakhi 2027", festivalDate: new Date("2027-08-28"), alertDate: new Date("2027-08-14") },
        { name: "Diwali 2027", festivalDate: new Date("2027-11-09"), alertDate: new Date("2027-10-19") },
        
        { name: "Holi 2028", festivalDate: new Date("2028-03-11"), alertDate: new Date("2028-02-19") },
        { name: "Eid 2028", festivalDate: new Date("2028-02-27"), alertDate: new Date("2028-02-06") },
        { name: "Rakhi 2028", festivalDate: new Date("2028-08-17"), alertDate: new Date("2028-08-03") },
        { name: "Diwali 2028", festivalDate: new Date("2028-10-29"), alertDate: new Date("2028-10-08") },
      ]
    });
  }

  const today = new Date();

  // Fetch active alerts (today >= alertDate and today <= festivalDate and not dismissed)
  const activeAlerts = await prisma.festivalAlert.findMany({
    where: {
      alertDate: { lte: today },
      festivalDate: { gte: today },
      isDismissed: false
    }
  });

  // Fetch blog posts
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

  const stockAdjustments = await prisma.stockAdjustment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const isWhatsAppAlertConfigured = !!process.env.CALLMEBOT_API_KEY;

  return (
    <div className="container" style={{ padding: '40px 0 100px' }}>
      <h1 className="heading-serif text-center" style={{ fontSize: '2.8rem', marginBottom: '40px' }}>
        Admin Dashboard
      </h1>
      <AdminClient 
        initialOrders={JSON.parse(JSON.stringify(orders))} 
        initialProducts={JSON.parse(JSON.stringify(products))} 
        initialAlerts={JSON.parse(JSON.stringify(activeAlerts))}
        initialBlogPosts={JSON.parse(JSON.stringify(blogPosts))}
        initialSubscriptions={JSON.parse(JSON.stringify(subscriptions))}
        initialPassports={JSON.parse(JSON.stringify(passports))}
        initialJarReturns={JSON.parse(JSON.stringify(jarReturns))}
        initialReferrals={JSON.parse(JSON.stringify(referrals))}
        initialStockAdjustments={JSON.parse(JSON.stringify(stockAdjustments))}
        isWhatsAppAlertConfigured={isWhatsAppAlertConfigured}
      />
    </div>
  );
}

