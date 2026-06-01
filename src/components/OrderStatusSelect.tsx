"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select 
      value={status} 
      onChange={handleStatusChange} 
      disabled={loading}
      className="form-control"
      style={{ width: 'auto', padding: '8px 12px' }}
    >
      <option value="NEW">New</option>
      <option value="CONFIRMED">Confirmed</option>
      <option value="PACKED">Packed</option>
      <option value="DISPATCHED">Dispatched</option>
      <option value="DELIVERED">Delivered</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );
}
