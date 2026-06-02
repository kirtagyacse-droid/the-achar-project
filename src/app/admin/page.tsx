import prisma from '@/lib/prisma';
import AdminClient from './AdminClient';

export const revalidate = 0; // Dynamic page

export default async function AdminDashboard() {
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

  return (
    <div className="container" style={{ padding: '40px 0 100px' }}>
      <h1 className="heading-serif text-center" style={{ fontSize: '2.8rem', marginBottom: '40px' }}>
        Auntie's Admin Dashboard
      </h1>
      <AdminClient 
        initialOrders={JSON.parse(JSON.stringify(orders))} 
        initialProducts={JSON.parse(JSON.stringify(products))} 
      />
    </div>
  );
}

