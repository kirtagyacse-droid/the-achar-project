"use client";
import React, { useState, useEffect } from 'react';
import OrderStatusSelect from '@/components/OrderStatusSelect';
import { JAIPUR_LOCALITIES } from '@/lib/jaipurLocalities';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stockStatus: string;
  stockCount: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  altPhone: string | null;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  notes: string | null;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  items: OrderItem[];
  dispatchPhotoUrl: string | null;
  isGiftOrder?: boolean;
  giftPackaging?: string | null;
  giftMessage?: string | null;
}

interface FestivalAlert {
  id: string;
  name: string;
  festivalDate: Date | string;
  alertDate: Date | string;
  isDismissed: boolean;
  message: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  isPublished: boolean;
  createdAt: Date | string;
}

interface AdminClientProps {
  initialOrders: Order[];
  initialProducts: Product[];
  initialAlerts: FestivalAlert[];
  initialBlogPosts: BlogPost[];
  initialSubscriptions: any[];
  initialPassports: any[];
  initialJarReturns: any[];
  initialReferrals: any[];
  isWhatsAppAlertConfigured: boolean;
}

export default function AdminClient({ 
  initialOrders, 
  initialProducts, 
  initialAlerts, 
  initialBlogPosts, 
  initialSubscriptions,
  initialPassports,
  initialJarReturns,
  initialReferrals,
  isWhatsAppAlertConfigured 
}: AdminClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [alerts, setAlerts] = useState<FestivalAlert[]>(initialAlerts);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [passports, setPassports] = useState(initialPassports);
  const [jarReturns, setJarReturns] = useState(initialJarReturns);
  const [referrals, setReferrals] = useState(initialReferrals);
  
  const [ordersSubTab, setOrdersSubTab] = useState<'recent' | 'reminders'>('recent');
  const [sentNudgeIds, setSentNudgeIds] = useState<string[]>([]);

  useEffect(() => {
    const sent = JSON.parse(localStorage.getItem('nudge_sent_order_ids') || '[]');
    setSentNudgeIds(sent);
  }, []);
  
  // Tabs: orders, inventory, production, customers, content, settings
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'production' | 'customers' | 'content' | 'settings'>('orders');

  // Customer phone numbers visibility map (private by default)
  const [visiblePhones, setVisiblePhones] = useState<Record<string, boolean>>({});

  // Add Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stockCount: '10',
    stockStatus: 'IN_STOCK',
    category: 'Pickle',
    imageUrl: '/uploads/keri-ka-khatta.jpg'
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick Stock Update Widget State
  const [quickStockInput, setQuickStockInput] = useState('');
  const [quickStockPreview, setQuickStockPreview] = useState<{
    product: Product;
    change: number;
    newStock: number;
  } | null>(null);

  // Activity Feed State (stored in localStorage)
  const [activityFeed, setActivityFeed] = useState<{ id: string; text: string; timestamp: string }[]>([]);

  // Production Planner State
  const [productionPlanProduct, setProductionPlanProduct] = useState<string>(
    initialProducts.length > 0 ? initialProducts[0].id : ''
  );

  // Blog Form State
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    coverImage: '',
    isPublished: false
  });

  // Track uploading state per order ID
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);

  // Available image presets for easy selection
  const imagePresets = [
    { label: 'Classic Mango (Sour/Khatta)', value: '/uploads/keri-ka-khatta.jpg' },
    { label: 'Sweet Mango (Meetha)', value: '/uploads/keri-ka-meetha.jpg' },
    { label: 'Green Chili (Teekhi Hari Mirch)', value: '/uploads/teekha-hari-mirch.jpg' },
    { label: 'Lehsua (Artisanal Delicacy)', value: '/uploads/lasuwa.jpg' },
    { label: 'Lemon (Nimbu Khatta Meetha)', value: '/uploads/nimbu-khatta-meetha.jpg' },
    { label: 'Mango with Onion', value: '/uploads/keri-with-onion.jpg' },
    { label: 'Mango with Desi Chana', value: '/uploads/keri-with-deshi-chana.jpg' },
    { label: 'Mango with Kabuli Chana', value: '/uploads/keri-with-kabli-chana.jpg' }
  ];

  // Load activity feed on mount
  useEffect(() => {
    const saved = localStorage.getItem('achar_admin_activity_log');
    if (saved) {
      try {
        setActivityFeed(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  // Helper functions for masking phone numbers
  const togglePhoneVisibility = (id: string) => {
    setVisiblePhones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDisplayPhone = (id: string, phone: string) => {
    if (visiblePhones[id]) return phone;
    if (phone.length <= 5) return '*****';
    return phone.slice(0, 5) + '*****';
  };

  // Helper function to print shipping address label (includes dispatch photo proof)
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
              <div class="logo">The Achar Project</div>
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
                The Achar Project Store<br/>
                C-Scheme, Jaipur, Rajasthan - 302001<br/>
                Contact: +91 98765 43210
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

  // 14 days ago range for predictive warning
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Sum quantities sold for each product in the last 14 days
  const productSalesMap: Record<string, number> = {};
  orders
    .filter(o => new Date(o.createdAt) >= fourteenDaysAgo)
    .forEach(o => {
      o.items.forEach(item => {
        productSalesMap[item.productId] = (productSalesMap[item.productId] || 0) + item.quantity;
      });
    });

  // Calculate predictive warnings
  const predictiveWarnings = products.map(product => {
    const totalSold = productSalesMap[product.id] || 0;
    const avgDailySales = totalSold / 14;
    
    if (avgDailySales > 0) {
      const daysRemaining = product.stockCount / avgDailySales;
      return {
        product,
        daysRemaining,
        avgDailySales,
        warning: daysRemaining < 5 
          ? `⚠️ ${product.name} runs out in ~${Math.round(daysRemaining)} days at current sales pace` 
          : null
      };
    } else {
      // Fallback: simple threshold (stock < 10)
      return {
        product,
        daysRemaining: Infinity,
        avgDailySales: 0,
        warning: product.stockCount < 10 
          ? `⚠️ ${product.name} is low on stock (${product.stockCount} jars left)` 
          : null
      };
    }
  })
  .filter(w => w.warning !== null)
  .sort((a, b) => {
    if (a.daysRemaining !== b.daysRemaining) {
      return a.daysRemaining - b.daysRemaining;
    }
    return a.product.stockCount - b.product.stockCount;
  });

  // Stats calculations
  const todayStr = new Date().toDateString();
  const ordersToday = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const jarsSoldToday = ordersToday.reduce((sum, o) => {
    return sum + o.items.reduce((s, item) => s + item.quantity, 0);
  }, 0);
  
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Handler to toggle product stock status
  const handleToggleStockStatus = async (product: Product) => {
    const newStatus = product.stockStatus === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK';
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockStatus: newStatus })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockStatus: newStatus } : p));
      } else {
        alert('Failed to update stock status');
      }
    } catch (e) {
      alert('Error updating stock status');
    }
  };

  // Handler to update product price
  const handleUpdatePrice = async (id: string, newPrice: number) => {
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newPrice })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
        alert('Price updated successfully!');
      } else {
        alert('Failed to update price');
      }
    } catch (e) {
      alert('Error updating price');
    }
  };

  // Handler to update stock count
  const handleUpdateStockCount = async (id: string, count: number) => {
    if (isNaN(count) || count < 0) {
      alert('Please enter a valid count');
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCount: count })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stockCount: count } : p));
        alert('Stock count updated successfully!');
      } else {
        alert('Failed to update stock count');
      }
    } catch (e) {
      alert('Error updating stock count');
    }
  };

  // Handler to delete a product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        alert('Product deleted successfully');
      } else {
        alert('Failed to delete product');
      }
    } catch (e) {
      alert('Error deleting product');
    }
  };

  // Handler to create a product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      const data = await res.json();
      
      if (res.ok) {
        setProducts(prev => [data.product, ...prev]);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          stockCount: '10',
          stockStatus: 'IN_STOCK',
          category: 'Pickle',
          imageUrl: '/uploads/keri-ka-khatta.jpg'
        });
        setShowAddForm(false);
        alert('New pickle added successfully!');
      } else {
        setErrorMsg(data.message || 'Failed to create product');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error creating product');
    } finally {
      setFormLoading(false);
    }
  };

  // Quick Stock Deduct Parser
  const parseQuickStockInput = (input: string) => {
    const match = input.trim().match(/^(.+?)\s*([+-]\d+)$/);
    if (!match) return null;
    return {
      query: match[1].trim(),
      change: parseInt(match[2], 10)
    };
  };

  // Quick Stock Submit Fuzzy Matcher
  const handleQuickStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseQuickStockInput(quickStockInput);
    if (!parsed) {
      alert("Invalid format! Please enter in the format: Product +/-Number (e.g. Mango -5)");
      return;
    }

    const { query, change } = parsed;
    const queryLower = query.toLowerCase();
    
    // Fuzzy substring match
    const matched = products.find(p => 
      p.name.toLowerCase().includes(queryLower) || 
      queryLower.includes(p.name.toLowerCase())
    );

    if (!matched) {
      alert(`No product found matching "${query}". Please check the spelling.`);
      return;
    }

    const newStock = Math.max(0, matched.stockCount + change);
    setQuickStockPreview({
      product: matched,
      change,
      newStock
    });
  };

  // Apply quick stock deduction and update state + log
  const handleQuickStockConfirm = async () => {
    if (!quickStockPreview) return;
    const { product, change, newStock } = quickStockPreview;
    
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCount: newStock })
      });
      
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stockCount: newStock } : p));
        
        const timestampStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const logText = `${product.name}: ${product.stockCount} → ${newStock} jars (${change > 0 ? '+' : ''}${change})`;
        
        const newLog = {
          id: Date.now().toString(),
          text: logText,
          timestamp: timestampStr
        };
        
        const updatedFeed = [newLog, ...activityFeed].slice(0, 20); // Limit to 20 activity records
        setActivityFeed(updatedFeed);
        localStorage.setItem('achar_admin_activity_log', JSON.stringify(updatedFeed));
        
        setQuickStockInput('');
        setQuickStockPreview(null);
        alert('Stock updated successfully!');
      } else {
        alert('Failed to save stock update');
      }
    } catch (e) {
      alert('Error updating stock count');
    }
  };

  // Delivery Clustering Logic
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

  const activeClusters = Object.entries(clusters).filter(([_, list]) => list.length > 0);

  const handleCopyAddresses = (locality: string, list: typeof todayOrders) => {
    const textToCopy = list.map(o => {
      const itemsText = o.items.map(i => `${i.product?.name || 'Deleted Product'} (x${i.quantity})`).join(', ');
      return `Name: ${o.customerName}\nPhone: ${o.phone}\nAddress: ${o.address}${o.landmark ? ` (Landmark: ${o.landmark})` : ''}, ${o.city}, ${o.state} - ${o.pincode}\nJars: ${itemsText}`;
    }).join('\n\n---\n\n');
    
    navigator.clipboard.writeText(textToCopy);
    alert(`Addresses for ${locality} copied to clipboard!`);
  };

  // Batch planner calculations
  const selectedPlannerProduct = products.find(p => p.id === productionPlanProduct);
  const pendingJarsCount = orders
    .filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
    .reduce((sum, o) => {
      const item = o.items.find(i => i.productId === productionPlanProduct);
      return sum + (item ? item.quantity : 0);
    }, 0);

  const netProductionNeeded = pendingJarsCount - (selectedPlannerProduct?.stockCount || 0);
  const suggestedBatchSize = netProductionNeeded > 0
    ? Math.ceil((netProductionNeeded * 1.2) / 5) * 5
    : 0;

  // Festival Dismissal Handler
  const handleDismissAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/admin/festivals/dismiss', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId })
      });
      if (res.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      } else {
        alert('Failed to dismiss alert');
      }
    } catch (e) {
      alert('Error dismissing alert');
    }
  };

  // Blog Posting Handler
  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      alert('Title and content are required');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      const data = await res.json();
      
      if (res.ok) {
        setBlogPosts(prev => [data.blogPost, ...prev]);
        setNewPost({ title: '', content: '', coverImage: '', isPublished: false });
        alert('Diary entry saved successfully!');
      } else {
        alert(data.message || 'Failed to create diary entry');
      }
    } catch (err) {
      alert('Error creating blog post');
    }
  };

  // Dispatch Photo Handler
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
        // Update local orders list state
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, dispatchPhotoUrl: data.order.dispatchPhotoUrl } : o));
        
        // Find order and trigger wa.me redirect
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const text = `Namaste ${order.customerName}! 🫙 Your Achar order has been packed and is on its way. — Aunty, The Achar Project`;
          const url = `https://wa.me/${order.phone}?text=${encodeURIComponent(text)}`;
          window.open(url, '_blank');
        }
        
        alert('Dispatch proof photo uploaded successfully! Customer notification window opened.');
      } else {
        alert(data.message || 'Upload failed');
      }
    } catch (e) {
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
      alert('Error removing photo');
    }
  };

  return (
    <div className="admin-dashboard-client">
      
      {/* Active Festival Alerts Banner List */}
      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {alerts.map(alert => {
            const daysLeft = Math.ceil(
              (new Date(alert.festivalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            return (
              <div 
                key={alert.id}
                style={{
                  background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white',
                  padding: '16px 24px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.2)',
                  animation: 'fadeInOverlay 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🪔</span>
                  <span style={{ fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {alert.name} is in {daysLeft} days — stock up now!
                  </span>
                </div>
                <button 
                  onClick={() => handleDismissAlert(alert.id)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '2px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase'
                  }}
                >
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Sales Summary Metrics Banner */}
      <div className="admin-stats-banner">
        <div className="admin-stat-card">
          <div>
            <span className="stat-label-lux">Daily Jars Sold</span>
            <div className="stat-val-lux">{jarsSoldToday} Jars</div>
          </div>
          <span className="stat-subtext-lux">Orders placed today ({ordersToday.length} orders)</span>
        </div>
        
        <div className="admin-stat-card">
          <div>
            <span className="stat-label-lux">Total Revenue (COD)</span>
            <div className="stat-val-lux">₹{totalRevenue}</div>
          </div>
          <span className="stat-subtext-lux">Total gross checkout value of all orders</span>
        </div>
        
        {/* Smarter Predictive Stock Warnings Banner */}
        <div className={`admin-stat-card ${predictiveWarnings.length > 0 ? 'alert-card' : ''}`}>
          <div>
            <span className="stat-label-lux">Stock Alerts & Predictions</span>
            <div className="stat-val-lux">{predictiveWarnings.length} Alerts</div>
          </div>
          {predictiveWarnings.length > 0 ? (
            <ul className="stat-alert-list">
              {predictiveWarnings.map((w, idx) => (
                <li key={idx} style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span>{w.warning}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="stat-subtext-lux" style={{ color: 'var(--color-success)', fontWeight: '600' }}>
              🟢 All pickles are well-stocked!
            </span>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          style={{ padding: '16px 20px', fontSize: '1rem', minHeight: '48px', flexGrow: 1, textAlign: 'center' }}
        >
          📋 Orders ({orders.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
          style={{ padding: '16px 20px', fontSize: '1rem', minHeight: '48px', flexGrow: 1, textAlign: 'center' }}
        >
          🌶️ Inventory ({products.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'production' ? 'active' : ''}`}
          onClick={() => setActiveTab('production')}
          style={{ padding: '16px 20px', fontSize: '1rem', minHeight: '48px', flexGrow: 1, textAlign: 'center' }}
        >
          🥣 Production
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
          style={{ padding: '16px 20px', fontSize: '1rem', minHeight: '48px', flexGrow: 1, textAlign: 'center' }}
        >
          👥 Customers
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
          style={{ padding: '16px 20px', fontSize: '1rem', minHeight: '48px', flexGrow: 1, textAlign: 'center' }}
        >
          ✍️ Content
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          style={{ padding: '16px 20px', fontSize: '1rem', minHeight: '48px', flexGrow: 1, textAlign: 'center' }}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="admin-section" style={{ animation: 'fadeInOverlay 0.3s ease' }}>
          <div>
            <h2 className="admin-sec-title">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="no-items-text">No orders have been placed yet.</p>
            ) : (
              <div className="admin-orders-list">
                {orders.map(order => (
                  <div key={order.id} className="admin-order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id-label">ORDER ID:</span>
                        <strong className="order-id-val"> #{order.id.substring(0, 8).toUpperCase()}</strong>
                        {order.isGiftOrder && (
                          <span style={{ 
                            marginLeft: '12px', 
                            padding: '2px 8px', 
                            backgroundColor: 'var(--color-accent-light)', 
                            color: 'var(--color-accent)', 
                            fontSize: '0.8rem', 
                            fontWeight: 700, 
                            borderRadius: '12px',
                            border: '1px solid rgba(123, 28, 28, 0.2)',
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
                            title={visiblePhones[order.id] ? "Hide phone number" : "Show phone number"}
                          >
                            {visiblePhones[order.id] ? "👁️‍🗨️" : "👁"}
                          </button>
                          
                          {order.altPhone && (
                            <>
                              <span style={{ marginLeft: '12px' }}>
                                <strong>Alt Phone:</strong> {getDisplayPhone(order.id + '_alt', order.altPhone)}
                                <button 
                                  type="button"
                                  className="btn-toggle-visibility"
                                  onClick={() => togglePhoneVisibility(order.id + '_alt')}
                                  title={visiblePhones[order.id + '_alt'] ? "Hide alt phone number" : "Show alt phone number"}
                                >
                                  {visiblePhones[order.id + '_alt'] ? "👁️‍🗨️" : "👁"}
                                </button>
                              </span>
                            </>
                          )}
                        </p>

                        <p>
                          <strong>Address:</strong><br />
                          {order.address}<br />
                          {order.landmark && `Landmark: ${order.landmark}, `}
                          {order.city}, {order.state} - {order.pincode}
                        </p>
                        {order.notes && <p className="order-note-text"><strong>Note:</strong> "{order.notes}"</p>}
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
                      <div style={{ marginTop: '20px', padding: '16px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img 
                          src={order.dispatchPhotoUrl} 
                          alt="Dispatch proof" 
                          style={{ width: '80px', height: '60px', objectFit: 'cover', border: '1px solid var(--border-medium)', borderRadius: '2px' }} 
                        />
                        <div style={{ flex: 1 }}>
                          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>✓ Dispatch proof uploaded</span>
                          <a href={order.dispatchPhotoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--color-accent)', textDecoration: 'underline' }}>View Full Image</a>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemovePhoto(order.id)}
                          style={{ color: 'var(--color-accent)', fontSize: '0.85rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
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
                        {/* Photo upload camera trigger (only active when status is DISPATCHED) */}
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
                                border: '1px solid var(--text-main)',
                                padding: '12px 18px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                backgroundColor: uploadingOrderId === order.id ? 'var(--bg-tertiary)' : 'transparent',
                                color: 'var(--text-main)'
                              }}
                            >
                              📷 {uploadingOrderId === order.id ? 'Uploading...' : 'Dispatch Photo'}
                            </label>
                          </div>
                        )}
                        
                        <button 
                          type="button" 
                          className="btn-print-label"
                          onClick={() => handlePrintLabel(order)}
                        >
                          🖨️ Print Shipping Label
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="admin-section" style={{ animation: 'fadeInOverlay 0.3s ease' }}>
          <div className="admin-header-row">
            <h2 className="admin-sec-title">Artisanal Pickles Menu</h2>
            <button 
              className={`btn-add-pickle ${showAddForm ? 'cancel' : ''}`}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              {showAddForm ? '❌ Close Form' : '➕ Add New Pickle'}
            </button>
          </div>

          {/* Add Product Form */}
          {showAddForm && (
            <div className="add-product-card">
              <h3 className="add-form-title">Enter Pickle Details</h3>
              {errorMsg && <div className="form-error-msg">{errorMsg}</div>}
              
              <form onSubmit={handleCreateProduct} className="add-product-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Pickle Name *</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Special Teekhi Hari Mirch" 
                      className="form-control"
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Price (₹) *</label>
                    <input 
                      required 
                      type="number" 
                      placeholder="e.g. 600" 
                      className="form-control"
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Pickle Image *</label>
                    <select 
                      className="form-control"
                      value={newProduct.imageUrl}
                      onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                    >
                      {imagePresets.map(preset => (
                        <option key={preset.value} value={preset.value}>{preset.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Jars In Stock *</label>
                    <input 
                      required 
                      type="number" 
                      className="form-control"
                      value={newProduct.stockCount}
                      onChange={e => setNewProduct({...newProduct, stockCount: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Status</label>
                    <select 
                      className="form-control"
                      value={newProduct.stockStatus}
                      onChange={e => setNewProduct({...newProduct, stockStatus: e.target.value})}
                    >
                      <option value="IN_STOCK">Available (In Stock)</option>
                      <option value="OUT_OF_STOCK">Unavailable (Out of Stock)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Pickle Category</label>
                    <select 
                      className="form-control"
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    >
                      <option value="Pickle">Classic Pickle (Achar)</option>
                      <option value="Sweet Pickle">Sweet Pickle</option>
                      <option value="Special">Speciality Delicacy</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Description *</label>
                  <textarea 
                    required 
                    rows={3} 
                    placeholder="Describe the flavor, spices, and ingredients..." 
                    className="form-control"
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>

                <button type="submit" disabled={formLoading} className="btn-submit-pickle">
                  {formLoading ? 'Adding Pickle...' : '💾 Save & Add Pickle to Store'}
                </button>
              </form>
            </div>
          )}

          {/* Products List */}
          <div className="admin-products-list">
            {products.map(product => {
              return (
                <ProductRow 
                  key={product.id} 
                  product={product} 
                  onToggleStatus={() => handleToggleStockStatus(product)}
                  onUpdatePrice={(price) => handleUpdatePrice(product.id, price)}
                  onUpdateStock={(count) => handleUpdateStockCount(product.id, count)}
                  onDelete={() => handleDeleteProduct(product.id, product.name)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* PRODUCTION TAB */}
      {activeTab === 'production' && (
        <div className="admin-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', animation: 'fadeInOverlay 0.3s ease' }}>
          
          {/* Quick Stock Update Widget */}
          <div className="add-product-card" style={{ gridColumn: 'span 2', margin: 0 }}>
            <h3 className="add-form-title">⚡ Quick Stock Update</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Deduct or add stock in one simple sentence. Fuzzy search automatically finds the matching pickle.
            </p>
            
            <form onSubmit={handleQuickStockSubmit} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. Mango -5  or  Lemon +10"
                value={quickStockInput}
                onChange={e => setQuickStockInput(e.target.value)}
                style={{ flex: 1, fontSize: '1.2rem', padding: '12px 18px', fontWeight: '500' }}
              />
              <button 
                type="submit" 
                className="btn-submit-pickle" 
                style={{ width: 'auto', padding: '0 24px', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              >
                Parse Command
              </button>
            </form>

            {/* Confirmation modal/preview box */}
            {quickStockPreview && (
              <div 
                style={{ 
                  marginTop: '20px', 
                  padding: '20px', 
                  backgroundColor: 'var(--color-accent-light)', 
                  border: '1px solid rgba(123, 28, 28, 0.2)',
                  borderRadius: '2px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  animation: 'slideDownFade 0.2s ease'
                }}
              >
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Confirm Stock Change
                  </span>
                  <strong style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>
                    {quickStockPreview.product.name}
                  </strong>
                  <span style={{ fontSize: '1.2rem', display: 'block', marginTop: '4px' }}>
                    Current: <strong>{quickStockPreview.product.stockCount}</strong> &rarr; Target: <strong style={{ color: 'var(--color-accent)' }}>{quickStockPreview.newStock}</strong> jars ({quickStockPreview.change > 0 ? '+' : ''}{quickStockPreview.change})
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={handleQuickStockConfirm}
                    style={{ 
                      backgroundColor: 'var(--text-main)', 
                      color: 'white', 
                      padding: '12px 20px', 
                      fontWeight: '700',
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem'
                    }}
                  >
                    Confirm Update
                  </button>
                  <button 
                    onClick={() => setQuickStockPreview(null)}
                    style={{ 
                      backgroundColor: 'transparent', 
                      border: '1px solid var(--border-medium)', 
                      color: 'var(--text-main)', 
                      padding: '12px 20px', 
                      fontWeight: '700',
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                      fontSize: '0.85rem'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Today's Production Planner Card */}
          <div className="add-product-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 className="add-form-title">🥣 Today's Production Planner</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Select a pickle below to calculate suggested batch sizes factoring in pending customer orders and safety buffer margins.
              </p>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Select Target Product</label>
                <select 
                  className="form-control"
                  value={productionPlanProduct}
                  onChange={e => setProductionPlanProduct(e.target.value)}
                  style={{ fontSize: '1.1rem', padding: '10px 14px' }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {selectedPlannerProduct && (
                <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', borderRadius: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Pending Customer Orders:</span>
                    <strong>{pendingJarsCount} Jars</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Current Shelf Stock:</span>
                    <strong>{selectedPlannerProduct.stockCount} Jars</strong>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
              {suggestedBatchSize > 0 ? (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                    SUGGESTED BATCH SIZE
                  </span>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.2' }}>
                    Make {suggestedBatchSize} Jars
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Includes 20% safety margin (rounded up to nearest 5)
                  </span>
                </div>
              ) : (
                <div style={{ color: 'var(--color-success)', fontWeight: '700', fontSize: '1.1rem', padding: '10px' }}>
                  ✓ You're fully stocked up for {selectedPlannerProduct?.name || 'this pickle'}. No batch needed today.
                </div>
              )}
            </div>
          </div>

          {/* Today's Delivery Clusters Card */}
          <div className="add-product-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
            <div>
              <h3 className="add-form-title">🗺️ Today's Delivery Clusters</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Orders placed today grouped by Jaipur localities for delivery mapping.
              </p>

              {activeClusters.length === 0 ? (
                <p className="no-items-text" style={{ padding: '30px 0', textAlign: 'center' }}>
                  No pending/dispatched orders placed today.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '6px' }}>
                  {activeClusters.map(([locality, list]) => {
                    return (
                      <div 
                        key={locality}
                        style={{
                          border: '1px solid var(--border-light)',
                          backgroundColor: 'var(--bg-secondary)',
                          padding: '14px 16px',
                          borderRadius: '2px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>{locality}</strong>
                          <span style={{ color: 'var(--color-accent)', fontWeight: '700', marginLeft: '8px' }}>
                            ({list.length} {list.length === 1 ? 'order' : 'orders'})
                          </span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            {list.map(o => o.customerName).join(', ')}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleCopyAddresses(locality, list)}
                          style={{
                            backgroundColor: 'var(--text-main)',
                            color: 'white',
                            padding: '8px 12px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            borderRadius: '2px',
                            textTransform: 'uppercase'
                          }}
                        >
                          📋 Copy
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Persistent Local Activity Log Card */}
          <div className="add-product-card" style={{ margin: 0, gridColumn: 'span 2' }}>
            <h3 className="add-form-title">📜 Recent Stock Actions Feed</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Chronological log of batch updates and manual deductions made during this session.
            </p>
            {activityFeed.length === 0 ? (
              <p className="no-items-text" style={{ padding: '40px 0', textAlign: 'center' }}>
                No stock updates logged in this session.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                {activityFeed.map(feed => (
                  <div 
                    key={feed.id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      paddingBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{feed.text}</span>
                    <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{feed.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="admin-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', animation: 'fadeInOverlay 0.3s ease' }}>
          
          {/* Achar Club Subscribers Card */}
          <div className="add-product-card" style={{ margin: 0 }}>
            <h3 className="add-form-title">📬 Achar Club Subscribers</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Active Members</span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--color-accent)' }}>
                  {subscriptions.filter((s: any) => s.isActive).length}
                </strong>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Total Plan Jars</span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>
                  {subscriptions.filter((s: any) => s.isActive).reduce((sum: number, s: any) => sum + s.planJars, 0)} Jars
                </strong>
              </div>
            </div>
            
            <h4 style={{ fontSize: '1rem', marginBottom: '10px', fontWeight: 600 }}>Subscribers List:</h4>
            {subscriptions.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>No club subscribers yet.</p>
            ) : (
              <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subscriptions.map((sub: any) => (
                  <div key={sub.id} style={{ border: '1px solid var(--border-light)', padding: '12px', fontSize: '0.95rem', backgroundColor: sub.isActive ? 'white' : '#f5f5f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>{sub.customerName}</span>
                      <span style={{ color: 'var(--color-accent)' }}>{sub.planJars} Jars/mo</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                      Phone: {sub.phone} | Address: {sub.address}
                    </div>
                    {sub.nextDelivery && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '4px', fontWeight: 500 }}>
                        Next Delivery: {new Date(sub.nextDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pickle Passports Card */}
          <div className="add-product-card" style={{ margin: 0 }}>
            <h3 className="add-form-title">🎴 Pickle Passports</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Total Passports</span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>{passports.length}</strong>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Completed</span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--color-success)' }}>
                  {passports.filter((p: any) => p.isComplete).length}
                </strong>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', marginBottom: '10px', fontWeight: 600 }}>Completed & Unclaimed (Free Jar Due):</h4>
            {passports.filter((p: any) => p.isComplete && !p.freeJarClaimed).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>No completed unclaimed passports.</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {passports.filter((p: any) => p.isComplete && !p.freeJarClaimed).map((p: any) => (
                  <div key={p.id} style={{ border: '1px solid rgba(27,94,32,0.2)', backgroundColor: 'var(--color-success-light)', padding: '12px', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: 'var(--color-success)' }}>{p.customerName}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>Phone: {p.phone}</div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Mark free jar claimed for ${p.customerName}?`)) {
                          try {
                            const res = await fetch(`/api/admin/claim-passport`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phone: p.phone })
                            });
                            if (res.ok) {
                              setPassports((prev: any) => prev.map((item: any) => item.phone === p.phone ? { ...item, freeJarClaimed: true } : item));
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      style={{
                        backgroundColor: 'var(--color-success)',
                        color: 'white',
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      🎁 Claim Free Jar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Jar Returns Card */}
          <div className="add-product-card" style={{ margin: 0 }}>
            <h3 className="add-form-title">♻️ Jar Return Requests</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Total Requests</span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>{jarReturns.length}</strong>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Jars Returned</span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--color-accent)' }}>
                  {jarReturns.reduce((sum: number, r: any) => sum + r.jarCount, 0)} Jars
                </strong>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', marginBottom: '10px', fontWeight: 600 }}>Recent Return Requests:</h4>
            {jarReturns.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>No jar return requests registered.</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {jarReturns.map((ret: any) => (
                  <div key={ret.id} style={{ border: '1px solid var(--border-light)', padding: '12px', fontSize: '0.95rem', backgroundColor: ret.discountApplied ? '#f9f9f9' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{ret.customerName}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Phone: {ret.phone} | Jars to Return: <strong style={{ color: 'var(--color-accent)' }}>{ret.jarCount}</strong>
                      </div>
                    </div>
                    <div>
                      {ret.discountApplied ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, padding: '4px 8px', backgroundColor: '#eaeaea' }}>
                          ✓ Applied
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600, padding: '4px 8px', backgroundColor: 'var(--color-accent-light)', border: '1px solid rgba(123,28,28,0.2)' }}>
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Referrals Card */}
          <div className="add-product-card" style={{ margin: 0 }}>
            <h3 className="add-form-title">🔗 Customer Referrals</h3>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Total Referrals</span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--text-main)' }}>{referrals.length}</strong>
              </div>
              <div style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '2px', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Completed</span>
                <strong style={{ fontSize: '2.5rem', color: 'var(--color-success)' }}>
                  {referrals.filter((r: any) => r.isUsed).length}
                </strong>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', marginBottom: '10px', fontWeight: 600 }}>Referral Codes:</h4>
            {referrals.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '10px' }}>No referrals generated yet.</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {referrals.map((ref: any) => (
                  <div key={ref.id} style={{ border: '1px solid var(--border-light)', padding: '12px', fontSize: '0.95rem', backgroundColor: ref.isUsed ? '#f9f9f9' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{ref.referrerName}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Phone: {ref.referrerPhone} | Code: <code style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{ref.referralCode}</code>
                      </div>
                    </div>
                    <div>
                      {ref.isUsed ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 600, padding: '4px 8px', backgroundColor: 'var(--color-success-light)' }}>
                          ✓ Used
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, padding: '4px 8px', backgroundColor: '#eaeaea' }}>
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Re-stock Nudges Card */}
          <div className="add-product-card" style={{ margin: 0, gridColumn: 'span 2' }}>
            <h3 className="add-form-title">⏰ Customer Re-stock Nudges</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Customers who placed an order 11-13 months ago and haven't ordered since. Nudge them via WhatsApp.
            </p>
            {(() => {
              const now = new Date();
              const remindersList = orders.filter(order => {
                if (order.status.toUpperCase() !== 'DELIVERED') return false;
                
                const orderDate = new Date(order.createdAt);
                const diffInMs = now.getTime() - orderDate.getTime();
                const diffInMonths = diffInMs / (1000 * 60 * 60 * 24 * 30.44);

                if (diffInMonths < 11 || diffInMonths > 13) return false;

                // Check for subsequent reorders
                const hasNewerOrder = orders.some(o => 
                  o.phone.replace(/[^0-9]/g, '') === order.phone.replace(/[^0-9]/g, '') &&
                  new Date(o.createdAt).getTime() > orderDate.getTime()
                );
                if (hasNewerOrder) return false;

                // Verify not already sent in this session
                if (sentNudgeIds.includes(order.id)) return false;

                return true;
              });

              if (remindersList.length === 0) {
                return <p className="no-items-text" style={{ padding: '40px 0', textAlign: 'center' }}>✓ No active restock reminders at this time.</p>;
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxHeight: '350px', overflowY: 'auto' }}>
                  {remindersList.map(order => {
                    const orderDateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    const productsList = order.items.map(item => `${item.product?.name || 'Deleted Product'} (x${item.quantity})`).join(', ');

                    return (
                      <div 
                        key={order.id} 
                        className="admin-order-card"
                        style={{
                          border: '1px solid var(--border-light)',
                          padding: '16px 20px',
                          backgroundColor: 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: '1 1 300px' }}>
                          <strong style={{ fontSize: '1.1rem', color: 'var(--text-main)', display: 'block' }}>{order.customerName}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                            Ordered <strong>{productsList}</strong> on <strong>{orderDateFormatted}</strong>.
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>
                            Phone: {order.phone} | ID: #{order.id.substring(0, 8).toUpperCase()}
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const cleanPhone = order.phone.replace(/[^0-9]/g, '');
                            const itemsString = order.items.map(item => item.product?.name || 'achar').join(' and ');
                            const siteUrl = window.location.origin;
                            const message = `Namaste ${order.customerName}! 🫙 It's been almost a year since you last ordered from us. Aunty has fresh ${itemsString} ready — shall we send you a jar? Order here: ${siteUrl} or reply to this message. 💛`;
                            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
                            
                            const updatedNudgeIds = [...sentNudgeIds, order.id];
                            localStorage.setItem('nudge_sent_order_ids', JSON.stringify(updatedNudgeIds));
                            setSentNudgeIds(updatedNudgeIds);
                            
                            window.open(whatsappUrl, '_blank');
                          }}
                          className="btn-lux-primary"
                          style={{ margin: 0, padding: '10px 16px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          💬 Send Nudge
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* CONTENT TAB */}
      {activeTab === 'content' && (
        <div className="admin-section" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', animation: 'fadeInOverlay 0.3s ease' }}>
          
          {/* Festival Stocking Alerts Card */}
          <div className="add-product-card" style={{ gridColumn: 'span 2', margin: 0 }}>
            <h3 className="add-form-title">🏮 Festival Stocking Alerts</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Active alerts to prepare inventory for upcoming festivals in Jaipur.
            </p>
            {alerts.length === 0 ? (
              <p className="no-items-text" style={{ padding: '30px 0', textAlign: 'center' }}>✓ No active festival alerts currently.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {alerts.map(alert => {
                  const daysLeft = Math.ceil(
                    (new Date(alert.festivalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div 
                      key={alert.id}
                      style={{
                        background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                        color: 'white',
                        padding: '16px 20px',
                        borderRadius: '2px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          🪔 {alert.name}
                        </strong>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>
                          Festival is in {daysLeft} days — stock up now!
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDismissAlert(alert.id)}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.4)',
                          padding: '6px 12px',
                          borderRadius: '2px',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          cursor: 'pointer'
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create Post Form */}
          <div className="add-product-card" style={{ margin: 0 }}>
            <h3 className="add-form-title">✍️ Write a Diary Entry</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Publish seasonal updates, grandmaternal recipes, or pickling logs in Aunty's Diary.
            </p>

            <form onSubmit={handleCreateBlogPost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Preparing the Summer Mango Curing Jars"
                  className="form-control"
                  value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                />
                {newPost.title && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
                    Slug: <code>{newPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}</code>
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Cover Image URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. /uploads/keri-ka-khatta.jpg"
                  className="form-control"
                  value={newPost.coverImage}
                  onChange={e => setNewPost({ ...newPost, coverImage: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Diary Content (Plain Paragraphs) *</label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Write your seasonal notes, pickling milestones, or general thoughts here..."
                  className="form-control"
                  value={newPost.content}
                  onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  style={{ lineHeight: '1.6', fontSize: '1rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  id="is-published-chk"
                  checked={newPost.isPublished}
                  onChange={e => setNewPost({ ...newPost, isPublished: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="is-published-chk" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                  Publish entry immediately (visible in the public diary feed)
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-submit-pickle"
                style={{ marginTop: '10px' }}
              >
                💾 Publish Entry
              </button>
            </form>
          </div>

          {/* Existing Posts List */}
          <div className="add-product-card" style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
            <h3 className="add-form-title">📖 Published Notes & Logs</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              All previously written blog posts and grandmaternal diaries.
            </p>

            {blogPosts.length === 0 ? (
              <p className="no-items-text" style={{ padding: '60px 0', textAlign: 'center' }}>
                No entries have been written yet. Start writing on the left!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '480px', overflowY: 'auto', paddingRight: '6px' }}>
                {blogPosts.map(post => (
                  <div 
                    key={post.id}
                    style={{
                      border: '1px solid var(--border-light)',
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '16px',
                      borderRadius: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)' }}>{post.title}</h4>
                      <span 
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '20px',
                          textTransform: 'uppercase',
                          backgroundColor: post.isPublished ? 'var(--color-success-light)' : '#EAEAEA',
                          color: post.isPublished ? 'var(--color-success)' : 'var(--text-muted)',
                          border: `1px solid ${post.isPublished ? 'rgba(27,94,32,0.1)' : 'rgba(0,0,0,0.05)'}`
                        }}
                      >
                        {post.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
                      Slug: <code>{post.slug}</code> • Date: {new Date(post.createdAt).toLocaleDateString('en-IN')}
                    </div>

                    <p 
                      style={{ 
                        fontSize: '0.85rem', 
                        color: 'var(--text-muted)', 
                        marginTop: '10px', 
                        lineHeight: '1.5',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {post.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="admin-section" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', animation: 'fadeInOverlay 0.3s ease' }}>
          
          {/* System Settings & WhatsApp Alerts Card */}
          <div className="add-product-card" style={{ margin: 0 }}>
            <h3 className="add-form-title">⚙️ System Settings & Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '16px',
                  border: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '2px'
                }}
              >
                <div>
                  <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)' }}>
                    WhatsApp Order Notifications
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Status of CallMeBot checkout trigger engine.
                  </span>
                </div>

                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    backgroundColor: isWhatsAppAlertConfigured ? 'var(--color-success-light)' : '#FEF3C7',
                    color: isWhatsAppAlertConfigured ? 'var(--color-success)' : '#D97706',
                    border: `1px solid ${isWhatsAppAlertConfigured ? 'rgba(27,94,32,0.2)' : 'rgba(217,119,6,0.2)'}`
                  }}
                >
                  {isWhatsAppAlertConfigured ? (
                    <>
                      <span>✓ Active</span>
                    </>
                  ) : (
                    <>
                      <span>⚠️ Missing Key</span>
                    </>
                  )}
                </div>
              </div>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.5' }}>
                Note: WhatsApp alerts run on the server using the configured <code>CALLMEBOT_API_KEY</code> and <code>AUNTY_WHATSAPP_NUMBER</code> credentials. If alerts are inactive, please specify them in your environment variables.
              </div>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}

// Subcomponent to encapsulate inline editing fields for each product row/card
function ProductRow({ 
  product, 
  onToggleStatus, 
  onUpdatePrice, 
  onUpdateStock, 
  onDelete 
}: { 
  product: Product; 
  onToggleStatus: () => void; 
  onUpdatePrice: (price: number) => void; 
  onUpdateStock: (count: number) => void; 
  onDelete: () => void; 
}) {
  const [localPrice, setLocalPrice] = useState(product.price.toString());
  const [localStock, setLocalStock] = useState(product.stockCount.toString());

  return (
    <div className="admin-prod-card">
      <div 
        className="prod-card-image"
        style={{ backgroundImage: `url(${product.imageUrl || '/placeholder.png'})` }}
      />
      
      <div className="prod-card-details">
        <div className="prod-card-main-info">
          <h3 className="prod-name-title">{product.name}</h3>
          <span className="prod-category-badge">{product.category}</span>
          <p className="prod-desc-text">{product.description}</p>
        </div>

        {/* Editing Grid (Big input boxes for Aunty to modify easily) */}
        <div className="prod-edit-controls">
          {/* Price Editor */}
          <div className="edit-control-item">
            <label className="edit-control-label">Price (₹)</label>
            <div className="edit-input-group">
              <input 
                type="number" 
                className="edit-input-box" 
                value={localPrice} 
                onChange={e => setLocalPrice(e.target.value)} 
              />
              <button 
                className="btn-save-inline"
                onClick={() => onUpdatePrice(parseFloat(localPrice))}
              >
                Save
              </button>
            </div>
          </div>

          {/* Stock Count Editor */}
          <div className="edit-control-item">
            <label className="edit-control-label">Jars Available</label>
            <div className="edit-input-group">
              <input 
                type="number" 
                className="edit-input-box" 
                value={localStock} 
                onChange={e => setLocalStock(e.target.value)} 
              />
              <button 
                className="btn-save-inline"
                onClick={() => onUpdateStock(parseInt(localStock))}
              >
                Save
              </button>
            </div>
          </div>

          {/* Toggle Stock Status */}
          <div className="edit-control-item">
            <label className="edit-control-label">Availability</label>
            <button 
              className={`btn-toggle-stock ${product.stockStatus === 'IN_STOCK' ? 'in-stock' : 'out-of-stock'}`}
              onClick={onToggleStatus}
            >
              {product.stockStatus === 'IN_STOCK' ? '🟢 Available' : '🔴 Out of Stock'}
            </button>
          </div>
        </div>

        <div className="prod-card-footer-actions">
          <button onClick={onDelete} className="btn-delete-prod">
            🗑️ Delete Pickle
          </button>
        </div>
      </div>
    </div>
  );
}
