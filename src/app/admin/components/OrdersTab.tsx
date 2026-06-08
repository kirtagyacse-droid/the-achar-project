"use client";
import React, { useState } from 'react';
import OrderStatusSelect from '@/components/OrderStatusSelect';
import { JAIPUR_LOCALITIES } from '@/lib/jaipurLocalities';
import { Order } from '../AdminClient';

interface OrdersTabProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export default function OrdersTab({ orders, setOrders }: OrdersTabProps) {
  const [subTab, setSubTab] = useState<'recent' | 'clusters'>('recent');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [visiblePhones, setVisiblePhones] = useState<Record<string, boolean>>({});
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);

  // Phone visibility helpers
  const togglePhoneVisibility = (id: string) => {
    setVisiblePhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDisplayPhone = (id: string, phone: string) => {
    if (visiblePhones[id]) return phone;
    if (phone.length <= 5) return '*****';
    return phone.slice(0, 5) + '*****';
  };

  // Label Printing
  const handlePrintLabel = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocker prevented opening the label. Please allow popups for this site.');
      return;
    }
    
    const itemsListHTML = order.items.map(item => `
      <li>
        <span style="font-weight: 600;">${item.product?.name || 'Deleted Product'}</span> 
        - Qty: ${item.quantity} (₹${item.price} each)
      </li>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shipping Label - Order #${order.id.substring(0, 8).toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Playfair+Display:wght@700&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              margin: 0;
              padding: 40px;
              color: #000;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label-box {
              border: 3px dashed #000;
              padding: 30px;
              max-width: 550px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .logo {
              font-family: 'Playfair Display', serif;
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .label-type {
              font-size: 12px;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-top: 5px;
              font-weight: 600;
              color: #555;
            }
            .cod-banner {
              background-color: #000;
              color: #fff;
              padding: 12px;
              text-align: center;
              font-size: 24px;
              font-weight: 800;
              margin-bottom: 25px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .address-section {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 25px;
            }
            .section-title {
              font-weight: 800;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #333;
              margin-bottom: 8px;
              display: block;
            }
            .customer-name {
              font-size: 20px;
              font-weight: 600;
              margin-bottom: 8px;
              display: block;
            }
            .items-section {
              border-top: 1px solid #ccc;
              border-bottom: 1px solid #ccc;
              padding: 15px 0;
              margin-bottom: 25px;
            }
            .items-list {
              margin: 0;
              padding-left: 20px;
              font-size: 14px;
            }
            .items-list li {
              margin-bottom: 6px;
            }
            .notes-box {
              font-style: italic;
              background-color: #f9f9f9;
              border-left: 3px solid #666;
              padding: 10px 15px;
              font-size: 14px;
              margin-bottom: 25px;
            }
            .dispatch-proof-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin-bottom: 25px;
              text-align: center;
            }
            .dispatch-proof-img {
              max-width: 200px;
              max-height: 140px;
              border: 1px solid #ccc;
              padding: 4px;
              border-radius: 4px;
              margin-top: 6px;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #444;
              border-top: 1px solid #000;
              padding-top: 15px;
            }
            .sender-info {
              line-height: 1.4;
            }
            .barcode {
              text-align: center;
              margin-top: 30px;
              font-family: monospace;
              font-size: 12px;
              letter-spacing: 4px;
            }
            @media print {
              body {
                padding: 0;
              }
              .label-box {
                border: 3px dashed #000;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-box">
            <div class="header">
              <div class="logo">RS Savoury</div>
              <div class="label-type">Cash On Delivery (COD) Address Label</div>
            </div>
            
            <div class="cod-banner">
              Collect COD: ₹${order.totalAmount}
            </div>
            
            <div class="address-section">
              <span class="section-title">DELIVER TO:</span>
              <span class="customer-name">${order.customerName}</span>
              ${order.address}<br/>
              ${order.landmark ? `Landmark: ${order.landmark}<br/>` : ''}
              <span style="font-weight: 600; font-size: 18px;">${order.city}, ${order.state} - ${order.pincode}</span><br/>
              <strong>Phone:</strong> ${order.phone} ${order.altPhone ? ` / ${order.altPhone}` : ''}
            </div>
            
            <div class="items-section">
              <span class="section-title">ORDER CONTENTS:</span>
              <ul class="items-list">
                ${itemsListHTML}
              </ul>
            </div>
            
            ${order.notes ? `
              <div class="notes-box">
                <strong>Delivery Note:</strong> "${order.notes}"
              </div>
            ` : ''}

            ${order.dispatchPhotoUrl ? `
              <div class="dispatch-proof-container">
                <span class="section-title" style="margin-bottom: 0;">Packed by Aunty Confirmation:</span>
                <img src="${order.dispatchPhotoUrl}" class="dispatch-proof-img" />
              </div>
            ` : ''}
            
            <div class="footer">
              <div class="sender-info">
                <strong>RETURN ADDRESS / SENDER:</strong><br/>
                RS Savoury Store<br/>
                110, Krishna Nagar, Teen Dukan, Dher Ke Balaji,<br/>
                Vidyadhar Nagar, Jaipur, Rajasthan - 302039<br/>
                Contact: +91 63505 92597, +91 63778 78454
              </div>
              <div style="text-align: right; line-height: 1.4;">
                <strong>Order ID:</strong> #${order.id.substring(0, 8).toUpperCase()}<br/>
                <strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}<br/>
                Standard COD Shipping
              </div>
            </div>
            
            <div class="barcode">
              ||||| | |||| ||| | ||| || |||| | ||||| | ||<br/>
              *${order.id.toUpperCase()}*
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Photo uploads
  const handleUploadPhoto = async (orderId: string, file: File) => {
    setUploadingOrderId(orderId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`/api/admin/orders/${orderId}/dispatch-photo`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, dispatchPhotoUrl: data.order.dispatchPhotoUrl } : o));
        
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const text = `Namaste ${order.customerName}! 🫙 Your order has been packed and is on its way. — Aunty, RS Savoury`;
          const url = `https://wa.me/${order.phone}?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
        }
        
        alert('Dispatch proof photo uploaded successfully! Customer notification window opened.');
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (e) {
      console.error('Error uploading file', e);
      alert('Error uploading file');
    } finally {
      setUploadingOrderId(null);
    }
  };

  const handleRemovePhoto = async (orderId: string) => {
    if (!confirm('Are you sure you want to remove this dispatch proof photo?')) return;
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/dispatch-photo`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, dispatchPhotoUrl: null } : o));
        alert('Dispatch proof photo removed!');
      } else {
        alert('Failed to remove photo');
      }
    } catch (e) {
      console.error('Error removing photo', e);
      alert('Error removing photo');
    }
  };

  // Localities Clustering
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => {
    const isToday = new Date(o.createdAt) >= todayStart;
    const isPendingOrDispatched = ['NEW', 'CONFIRMED', 'PACKED', 'DISPATCHED'].includes(o.status);
    return isToday && isPendingOrDispatched;
  });

  const clusters: Record<string, typeof todayOrders> = {};
  JAIPUR_LOCALITIES.forEach(loc => {
    clusters[loc] = [];
  });
  clusters['Other Areas'] = [];

  todayOrders.forEach(order => {
    let matched = false;
    const fullAddress = `${order.address} ${order.landmark || ''} ${order.city}`.toLowerCase();
    
    for (const loc of JAIPUR_LOCALITIES) {
      if (fullAddress.includes(loc.toLowerCase())) {
        clusters[loc].push(order);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      clusters['Other Areas'].push(order);
    }
  });

  const activeClusters = Object.entries(clusters).filter(([, list]) => list.length > 0);

  const handleCopyAddresses = (locality: string, list: typeof todayOrders) => {
    const textToCopy = list.map(o => {
      const itemsText = o.items.map(i => `${i.product?.name || 'Deleted Product'} (x${i.quantity})`).join(', ');
      return `Name: ${o.customerName}\nPhone: ${o.phone}\nAddress: ${o.address}${o.landmark ? ` (Landmark: ${o.landmark})` : ''}, ${o.city}, ${o.state} - ${o.pincode}\nJars: ${itemsText}`;
    }).join('\n\n---\n\n');
    
    navigator.clipboard.writeText(textToCopy);
    alert(`Addresses for ${locality} copied to clipboard!`);
  };

  // Filter orders by status
  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  return (
    <div className="admin-section">
      {/* Sub-tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--admin-border)', marginBottom: '24px', gap: '20px' }}>
        <button
          onClick={() => setSubTab('recent')}
          style={{
            padding: '12px 6px',
            border: 'none',
            borderBottom: subTab === 'recent' ? '2px solid var(--admin-maroon)' : '2px solid transparent',
            background: 'transparent',
            fontWeight: subTab === 'recent' ? '700' : '500',
            color: subTab === 'recent' ? 'var(--admin-maroon)' : 'var(--admin-text)',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          Recent Orders
        </button>
        <button
          onClick={() => setSubTab('clusters')}
          style={{
            padding: '12px 6px',
            border: 'none',
            borderBottom: subTab === 'clusters' ? '2px solid var(--admin-maroon)' : '2px solid transparent',
            background: 'transparent',
            fontWeight: subTab === 'clusters' ? '700' : '500',
            color: subTab === 'clusters' ? 'var(--admin-maroon)' : 'var(--admin-text)',
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          🗺️ Today&apos;s Localities Clusters ({todayOrders.length})
        </button>
      </div>

      {subTab === 'recent' ? (
        <div>
          {/* Status Filter buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {['ALL', 'NEW', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--admin-border)',
                  backgroundColor: filterStatus === status ? 'var(--admin-maroon)' : '#FFFFFF',
                  color: filterStatus === status ? '#FFFFFF' : 'var(--admin-text)',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {status} ({status === 'ALL' ? orders.length : orders.filter(o => o.status === status).length})
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <p className="no-items-text">No orders match the selected filter.</p>
          ) : (
            <div className="admin-orders-list">
              {filteredOrders.map(order => (
                <div key={order.id} className="admin-order-card">
                  <div className="order-card-header">
                    <div>
                      <span className="order-id-label">ORDER ID:</span>
                      <strong className="order-id-val"> #{order.id.substring(0, 8).toUpperCase()}</strong>
                      {order.isGiftOrder && (
                        <span style={{ 
                          marginLeft: '12px', 
                          padding: '2px 8px', 
                          backgroundColor: 'var(--admin-maroon-light)', 
                          color: 'var(--admin-maroon)', 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          borderRadius: '12px',
                          border: '1px solid rgba(154, 44, 44, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          🎁 Gift Box {order.giftPackaging ? `(${order.giftPackaging})` : ''}
                        </span>
                      )}
                    </div>
                    <div className="order-date-label">
                      {new Date(order.createdAt).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="order-card-grid">
                    {/* Customer Info */}
                    <div className="order-info-block">
                      <h4 className="info-block-title">Customer Details</h4>
                      <p><strong>Name:</strong> {order.customerName}</p>
                      
                      <p>
                        <strong>Phone:</strong> {getDisplayPhone(order.id, order.phone)}
                        <button 
                          type="button"
                          className="btn-toggle-visibility"
                          onClick={() => togglePhoneVisibility(order.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '6px', fontSize: '1rem' }}
                          title={visiblePhones[order.id] ? "Hide phone number" : "Show phone number"}
                        >
                          {visiblePhones[order.id] ? "👁️‍🗨️" : "👁"}
                        </button>
                        
                        {order.altPhone && (
                          <span style={{ marginLeft: '12px' }}>
                            <strong>Alt Phone:</strong> {getDisplayPhone(order.id + '_alt', order.altPhone)}
                            <button 
                              type="button"
                              className="btn-toggle-visibility"
                              onClick={() => togglePhoneVisibility(order.id + '_alt')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '6px', fontSize: '1rem' }}
                              title={visiblePhones[order.id + '_alt'] ? "Hide alt phone number" : "Show alt phone number"}
                            >
                              {visiblePhones[order.id + '_alt'] ? "👁️‍🗨️" : "👁"}
                            </button>
                          </span>
                        )}
                      </p>

                      <p>
                        <strong>Address:</strong><br />
                        {order.address}<br />
                        {order.landmark && `Landmark: ${order.landmark}, `}
                        {order.city}, {order.state} - {order.pincode}
                      </p>
                      {order.notes && <p className="order-note-text"><strong>Note:</strong> &quot;{order.notes}&quot;</p>}
                    </div>

                    {/* Order Items */}
                    <div className="order-items-block">
                      <h4 className="info-block-title">Jars Ordered</h4>
                      <ul className="ordered-items-list">
                        {order.items.map(item => (
                          <li key={item.id}>
                            <span className="item-name">{item.product?.name || 'Deleted Product'}</span>
                            <span className="item-qty-price">{item.quantity} x ₹{item.price} = <strong>₹{item.price * item.quantity}</strong></span>
                          </li>
                        ))}
                      </ul>
                      <div className="order-card-total">
                        <span>Total COD Amount:</span>
                        <strong className="total-val">₹{order.totalAmount}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Dispatch proof photo display block */}
                  {order.dispatchPhotoUrl && (
                    <div style={{ 
                      marginTop: '20px', 
                      padding: '16px', 
                      border: '1px solid var(--admin-border)', 
                      backgroundColor: '#F9F9FB', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '16px' 
                    }}>
                      <img 
                        src={order.dispatchPhotoUrl} 
                        alt="Dispatch proof" 
                        style={{ width: '80px', height: '60px', objectFit: 'cover', border: '1px solid var(--admin-border)', borderRadius: '2px' }} 
                      />
                      <div style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-success)', textTransform: 'uppercase' }}>✓ Dispatch proof uploaded</span>
                        <a href={order.dispatchPhotoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--admin-maroon)', textDecoration: 'underline' }}>View Full Image</a>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemovePhoto(order.id)}
                        style={{ color: 'var(--admin-maroon)', fontSize: '0.85rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        🗑️ Remove Photo
                      </button>
                    </div>
                  )}

                  <div className="order-card-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className="status-label">Delivery Status:</span>
                      <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* Photo upload camera trigger */}
                      {order.status === 'DISPATCHED' && (
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            id={`file-input-${order.id}`}
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadPhoto(order.id, file);
                              }
                            }}
                          />
                          <label 
                            htmlFor={`file-input-${order.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              border: '1px solid var(--admin-text)',
                              padding: '12px 18px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              letterSpacing: '0.05em',
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              backgroundColor: uploadingOrderId === order.id ? '#FAFAFA' : 'transparent',
                              color: 'var(--admin-text)'
                            }}
                          >
                            📷 {uploadingOrderId === order.id ? 'Uploading...' : 'Dispatch Photo'}
                          </label>
                        </div>
                      )}
                      
                      <button 
                        type="button" 
                        className="admin-logout-btn"
                        style={{ padding: '12px 18px' }}
                        onClick={() => handlePrintLabel(order)}
                      >
                        🖨️ Print Label
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* CLUSTERS VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="admin-premium-card" style={{ margin: 0 }}>
            <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>🗺️ Jaipur Delivery Clusters</h3>
            <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Orders placed today grouped by geographic localities in Jaipur for direct rider copy-routing.
            </p>

            {activeClusters.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--admin-muted)' }}>
                No active orders placed today for clustering.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {activeClusters.map(([locality, list]) => (
                  <div 
                    key={locality}
                    style={{
                      border: '1px solid var(--admin-border)',
                      backgroundColor: '#FFFFFF',
                      padding: '16px',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--admin-maroon)' }}>{locality}</strong>
                        <span style={{ 
                          backgroundColor: 'var(--admin-maroon-light)', 
                          color: 'var(--admin-maroon)', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          fontSize: '0.75rem', 
                          fontWeight: '700' 
                        }}>
                          {list.length} {list.length === 1 ? 'order' : 'orders'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                        {list.map(o => o.customerName).join(', ')}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleCopyAddresses(locality, list)}
                      className="admin-logout-btn"
                      style={{ width: '100%', padding: '8px' }}
                    >
                      📋 Copy Addresses List
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
