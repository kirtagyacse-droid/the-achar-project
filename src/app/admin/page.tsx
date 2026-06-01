import prisma from '@/lib/prisma';
import OrderStatusSelect from '@/components/OrderStatusSelect';

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

  const products = await prisma.product.findMany();

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Admin Dashboard</h1>
      
      <div style={{ marginBottom: '60px' }}>
        <h2 className="heading-serif" style={{ fontSize: '2rem', marginBottom: '20px' }}>Recent Orders</h2>
        
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map(order => (
              <div key={order.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div>
                    <strong>Order ID:</strong> #{order.id.substring(0,8).toUpperCase()} <br/>
                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong>Total:</strong> ₹{order.totalAmount} <br/>
                    <strong>Method:</strong> {order.paymentMethod}
                  </div>
                </div>
                
                <div style={{ backgroundColor: '#F9F9F9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <strong>Customer:</strong> {order.customerName} ({order.phone}) <br/>
                  <strong>Address:</strong> {order.address}, {order.city}, {order.state} - {order.pincode}
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>Items:</strong>
                  <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                    {order.items.map(item => (
                      <li key={item.id}>{item.quantity}x {item.product.name} (₹{item.price * item.quantity})</li>
                    ))}
                  </ul>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <strong>Status:</strong>
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="heading-serif" style={{ fontSize: '2rem' }}>Products</h2>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', border: '1px solid var(--border-light)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-light)' }}>
              <th style={{ padding: '15px' }}>Name</th>
              <th style={{ padding: '15px' }}>Price</th>
              <th style={{ padding: '15px' }}>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '15px' }}>{product.name}</td>
                <td style={{ padding: '15px' }}>₹{product.price}</td>
                <td style={{ padding: '15px' }}>
                  <span style={{ color: product.stockStatus === 'IN_STOCK' ? 'var(--color-success)' : 'var(--color-accent)' }}>
                    {product.stockStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>* Product editing is managed directly via the database for this MVP.</p>
      </div>
    </div>
  );
}
