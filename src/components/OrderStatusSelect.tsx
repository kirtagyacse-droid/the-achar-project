"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  // Update status state when prop changes
  const [prevPropsStatus, setPrevPropsStatus] = useState(currentStatus);
  if (currentStatus !== prevPropsStatus) {
    setPrevPropsStatus(currentStatus);
    setStatus(currentStatus);
  }

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const oldStatus = status;
    setStatus(newStatus);
    setLoading(true);
    setShowSuccess(false);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setShowSuccess(true);
        router.refresh();
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        setStatus(oldStatus);
        alert('Failed to update status');
      }
    } catch (err) {
      setStatus(oldStatus);
      alert('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColorConfig = (statusVal: string) => {
    switch (statusVal) {
      case 'NEW':
        return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
      case 'CONFIRMED':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
      case 'PACKED':
        return { bg: '#FFEDD5', text: '#9A3412', border: '#FDBA74' };
      case 'DISPATCHED':
        return { bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' };
      case 'DELIVERED':
        return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' };
      default:
        return { bg: '#FFFFFF', text: '#2C2C2C', border: '#E5E5E5' };
    }
  };

  const colors = getStatusColorConfig(status);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
      <select 
        value={status} 
        onChange={handleStatusChange} 
        disabled={loading}
        className={`status-select-premium ${showSuccess ? 'success-pulse' : ''}`}
        style={{
          width: 'auto',
          padding: '8px 36px 8px 16px',
          fontSize: '0.88rem',
          fontWeight: '600',
          borderRadius: '8px',
          border: `2px solid ${showSuccess ? '#166534' : colors.border}`,
          backgroundColor: colors.bg,
          color: colors.text,
          cursor: loading ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M7 9l3 3 3-3' stroke='${encodeURIComponent(colors.text)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          backgroundSize: '18px',
          boxShadow: showSuccess 
            ? '0 0 0 4px rgba(22, 101, 52, 0.15)' 
            : '0 1px 2px rgba(0, 0, 0, 0.05)',
        }}
      >
        <option value="NEW">New</option>
        <option value="CONFIRMED">Confirmed</option>
        <option value="PACKED">Packed</option>
        <option value="DISPATCHED">Dispatched</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      {/* Loading state spinner */}
      {loading && (
        <span className="status-spinner" />
      )}

      {/* Success feedback badge */}
      {showSuccess && (
        <span className="status-success-badge">
          ✓ Updated
        </span>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseBorder {
          0% { border-color: #166534; }
          50% { border-color: #22C55E; }
          100% { border-color: #166534; }
        }
        .status-select-premium:focus {
          border-color: #9A2C2C !important;
          box-shadow: 0 0 0 3px rgba(154, 44, 44, 0.1) !important;
        }
        .success-pulse {
          animation: pulseBorder 1.5s ease-in-out infinite;
        }
        .status-spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(154, 44, 44, 0.15);
          border-top-color: #9A2C2C;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        .status-success-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #166534;
          background-color: #DCFCE7;
          border: 1px solid rgba(22, 101, 52, 0.2);
          padding: 4px 10px;
          border-radius: 20px;
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          user-select: none;
          box-shadow: 0 2px 4px rgba(22, 101, 52, 0.05);
        }
      `}</style>
    </div>
  );
}

