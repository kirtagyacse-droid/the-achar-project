"use client";
import React, { useState } from 'react';
import { Product } from '../AdminClient';

interface InventoryTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  activityFeed: { id: string; text: string; timestamp: string }[];
  setActivityFeed: React.Dispatch<React.SetStateAction<{ id: string; text: string; timestamp: string }[]>>;
}

export default function InventoryTab({
  products,
  setProducts,
  activityFeed,
  setActivityFeed
}: InventoryTabProps) {
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

  // Quick Stock Update State
  const [quickStockInput, setQuickStockInput] = useState('');
  const [quickStockPreview, setQuickStockPreview] = useState<{
    product: Product;
    change: number;
    newStock: number;
  } | null>(null);

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

  // Actions Handlers
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
    } catch (error) {
      console.error('Error toggling status', error);
      alert('Error updating stock status');
    }
  };

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
    } catch (error) {
      console.error('Error updating price', error);
      alert('Error updating price');
    }
  };

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
    } catch (error) {
      console.error('Error updating stock count', error);
      alert('Error updating stock count');
    }
  };

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
    } catch (error) {
      console.error('Error deleting product', error);
      alert('Error deleting product');
    }
  };

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
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Network error creating product';
      setErrorMsg(msg);
    } finally {
      setFormLoading(false);
    }
  };

  // Fuzzy Stock updates parser
  const parseQuickStockInput = (input: string) => {
    const match = input.trim().match(/^(.+?)\s*([+-]\d+)$/);
    if (!match) return null;
    return {
      query: match[1].trim(),
      change: parseInt(match[2], 10)
    };
  };

  const handleQuickStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseQuickStockInput(quickStockInput);
    if (!parsed) {
      alert("Invalid format! Please enter in the format: Product +/-Number (e.g. Mango -5)");
      return;
    }

    const { query, change } = parsed;
    const queryLower = query.toLowerCase();
    
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
        
        const updatedFeed = [newLog, ...activityFeed].slice(0, 20);
        setActivityFeed(updatedFeed);
        localStorage.setItem('achar_admin_activity_log', JSON.stringify(updatedFeed));
        
        setQuickStockInput('');
        setQuickStockPreview(null);
        alert('Stock updated successfully!');
      } else {
        alert('Failed to save stock update');
      }
    } catch (error) {
      console.error('Error confirming stock update', error);
      alert('Error updating stock count');
    }
  };

  return (
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

            <div className="form-group">
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

      {/* Fuzzy Stock Widget & Activity Feed Block */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Quick Stock adjustments */}
        <div className="admin-premium-card" style={{ margin: 0 }}>
          <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>⚡ Quick Stock Update</h3>
          <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Deduct or add stock using a quick phrase. Fuzzy matching auto-detects the product (e.g. <code>Mango -5</code>).
          </p>

          <form onSubmit={handleQuickStockSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Lemon +10  or  Hari Mirch -2"
              value={quickStockInput}
              onChange={e => setQuickStockInput(e.target.value)}
              style={{ fontSize: '1.1rem', fontWeight: '500' }}
            />
            <button 
              type="submit" 
              className="btn-submit-pickle" 
              style={{ width: 'auto', padding: '0 20px', margin: 0 }}
            >
              Parse
            </button>
          </form>

          {quickStockPreview && (
            <div style={{ 
              marginTop: '16px', 
              padding: '16px', 
              backgroundColor: 'var(--admin-maroon-light)', 
              border: '1px solid rgba(154, 44, 44, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-maroon)', textTransform: 'uppercase' }}>Confirm Change</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{quickStockPreview.product.name}</div>
                <div style={{ fontSize: '0.95rem', marginTop: '2px' }}>
                  Current: <strong>{quickStockPreview.product.stockCount}</strong> &rarr; Target: <strong>{quickStockPreview.newStock}</strong> ({quickStockPreview.change > 0 ? '+' : ''}{quickStockPreview.change})
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleQuickStockConfirm} className="btn-save-inline" style={{ padding: '8px 12px' }}>Confirm</button>
                <button onClick={() => setQuickStockPreview(null)} className="admin-logout-btn" style={{ padding: '8px 12px' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Stock Log Feed */}
        <div className="admin-premium-card" style={{ margin: 0 }}>
          <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>📜 Stock Adjustment Feed</h3>
          <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
            History of stock changes made in this session.
          </p>
          
          <div className="inventory-stock-log">
            {activityFeed.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
                No stock updates logged yet.
              </div>
            ) : (
              activityFeed.map(feed => (
                <div key={feed.id} className="inventory-log-row">
                  <span>{feed.text}</span>
                  <span style={{ color: 'var(--admin-muted)' }}>{feed.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Products list */}
      <div className="admin-products-list">
        {products.map(product => (
          <ProductRow 
            key={product.id} 
            product={product} 
            onToggleStatus={() => handleToggleStockStatus(product)}
            onUpdatePrice={(price) => handleUpdatePrice(product.id, price)}
            onUpdateStock={(count) => handleUpdateStockCount(product.id, count)}
            onDelete={() => handleDeleteProduct(product.id, product.name)}
          />
        ))}
      </div>
    </div>
  );
}

interface ProductRowProps {
  product: Product; 
  onToggleStatus: () => void; 
  onUpdatePrice: (price: number) => void; 
  onUpdateStock: (count: number) => void; 
  onDelete: () => void; 
}

function ProductRow({ 
  product, 
  onToggleStatus, 
  onUpdatePrice, 
  onUpdateStock, 
  onDelete 
}: ProductRowProps) {
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
          <button onClick={onDelete} className="btn-delete-prod" style={{ cursor: 'pointer' }}>
            🗑️ Delete Pickle
          </button>
        </div>
      </div>
    </div>
  );
}
