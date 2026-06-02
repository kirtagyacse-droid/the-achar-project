"use client";
import React, { useState } from 'react';
import OrderStatusSelect from '@/components/OrderStatusSelect';

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
}

interface AdminClientProps {
  initialOrders: Order[];
  initialProducts: Product[];
}

export default function AdminClient({ initialOrders, initialProducts }: AdminClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Add Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stockCount: '10',
    stockStatus: 'IN_STOCK',
    category: 'Pickle',
    imageUrl: '/uploads/kayri-ka-khatta.jpg'
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Available image presets for easy selection
  const imagePresets = [
    { label: 'Classic Mango (Sour/Khatta)', value: '/uploads/kayri-ka-khatta.jpg' },
    { label: 'Sweet Mango (Meetha)', value: '/uploads/kayri-ka-meetha.jpg' },
    { label: 'Green Chili (Teekhi Hari Mirch)', value: '/uploads/teekha-hari-mirch.jpg' },
    { label: 'Lehsua (Artisanal Delicacy)', value: '/uploads/lasuwa.jpg' },
    { label: 'Lemon (Nimbu Khatta Meetha)', value: '/uploads/nimbu-khatta-meetha.jpg' },
    { label: 'Mango with Onion', value: '/uploads/kayri-with-onion.jpg' },
    { label: 'Mango with Desi Chana', value: '/uploads/kayri-with-deshi-chana.jpg' },
    { label: 'Mango with Kabuli Chana', value: '/uploads/kayri-with-kabli-chana.jpg' }
  ];

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
          imageUrl: '/uploads/kayri-ka-khatta.jpg'
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

  return (
    <div className="admin-dashboard-client">
      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📁 Manage Orders ({orders.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          🌶️ Manage Pickles ({products.length})
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="admin-section">
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
                      <p><strong>Phone:</strong> {order.phone} {order.altPhone && `(Alt: ${order.altPhone})`}</p>
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

                  <div className="order-card-actions">
                    <span className="status-label">Delivery Status:</span>
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="admin-section">
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

          {/* Products List (Aunty-friendly edit grid) */}
          <div className="admin-products-list">
            {products.map(product => {
              // Local inputs for modifying price & stock count on the fly
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
