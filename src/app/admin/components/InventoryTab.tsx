"use client";
import React, { useState } from 'react';
import { Product, Order, StockAdjustment } from '../AdminClient';

interface InventoryTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  stockAdjustments: StockAdjustment[];
  setStockAdjustments: React.Dispatch<React.SetStateAction<StockAdjustment[]>>;
  orders: Order[];
}

export default function InventoryTab({
  products,
  setProducts,
  stockAdjustments,
  setStockAdjustments,
  orders
}: InventoryTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stockCount: '10',
    stockStatus: 'IN_STOCK',
    category: 'Pickle',
    imageUrl: '/uploads/keri-ka-khatta.jpg',
    batchNumber: ''
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Manual Adjustment Modal State
  const [activeAdjProduct, setActiveAdjProduct] = useState<Product | null>(null);
  const [adjTargetStock, setAdjTargetStock] = useState<number>(0);
  const [adjReason, setAdjReason] = useState<string>('manual_audit');
  const [adjNotes, setAdjNotes] = useState<string>('');
  const [adjBatchNumber, setAdjBatchNumber] = useState<string>('');

  // Quick Stock Update State
  const [quickStockInput, setQuickStockInput] = useState('');
  const [fuzzyMatches, setFuzzyMatches] = useState<Product[]>([]);
  const [fuzzyChange, setFuzzyChange] = useState<number>(0);
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

  // 1. Compute rolling 14-day burn rate for each product from the orders list
  const getBurnRateMetrics = (productId: string) => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentOrderItems = orders
      .filter(o => new Date(o.createdAt) >= fourteenDaysAgo)
      .flatMap(o => o.items)
      .filter(item => item.productId === productId);

    const totalSold = recentOrderItems.reduce((sum, item) => sum + item.quantity, 0);
    const dailyBurn = totalSold / 14;

    return {
      dailyBurnRate: dailyBurn,
      totalSoldRecent: totalSold
    };
  };

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

  const handleUpdateBatchInfo = async (id: string, batchNumber: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchNumber, batchDate: new Date() })
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p.id === id ? { ...p, batchNumber: data.product.batchNumber, batchDate: data.product.batchDate } : p));
        alert('Batch information updated successfully!');
      } else {
        alert('Failed to update batch information');
      }
    } catch (error) {
      console.error('Error updating batch information', error);
      alert('Error updating batch information');
    }
  };

  // Open the manual adjustment modal
  const openAdjustmentModal = (product: Product, targetStock: number) => {
    setActiveAdjProduct(product);
    setAdjTargetStock(targetStock);
    setAdjReason('manual_audit');
    setAdjNotes('');
    setAdjBatchNumber(product.batchNumber || '');
  };

  const handleConfirmManualAdjustment = async () => {
    if (!activeAdjProduct) return;
    const diff = adjTargetStock - activeAdjProduct.stockCount;
    if (diff === 0) {
      setActiveAdjProduct(null);
      return;
    }

    try {
      const res = await fetch('/api/admin/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeAdjProduct.id,
          quantity: diff,
          reason: adjReason,
          notes: adjNotes || 'Manual stock update',
          batchNumber: adjBatchNumber || null
        })
      });

      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p.id === activeAdjProduct.id ? data.product : p));
        setStockAdjustments(prev => [data.adjustment, ...prev]);
        setActiveAdjProduct(null);
        alert('Stock adjusted and logged in database successfully!');
      } else {
        const err = await res.json();
        alert(`Failed to save adjustment: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adjusting stock', error);
      alert('Network error adjusting stock');
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
        
        // Fetch fresh adjustments to show initial audit log
        const adjRes = await fetch('/api/admin/stock-adjustments');
        if (adjRes.ok) {
          const adjData = await adjRes.json();
          setStockAdjustments(adjData.adjustments);
        }

        setNewProduct({
          name: '',
          description: '',
          price: '',
          stockCount: '10',
          stockStatus: 'IN_STOCK',
          category: 'Pickle',
          imageUrl: '/uploads/keri-ka-khatta.jpg',
          batchNumber: ''
        });
        setShowAddForm(false);
        alert('New pickle added successfully!');
      } else {
        setErrorMsg(data.error || 'Failed to create product');
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
    setFuzzyMatches([]);
    setQuickStockPreview(null);

    const parsed = parseQuickStockInput(quickStockInput);
    if (!parsed) {
      alert("Invalid format! Please enter in the format: Product +/-Number (e.g. Mango -5)");
      return;
    }

    const { query, change } = parsed;
    const queryLower = query.toLowerCase();
    
    // Find all potential matching products
    const matches = products.filter(p => 
      p.name.toLowerCase().includes(queryLower) || 
      queryLower.includes(p.name.toLowerCase())
    );

    if (matches.length === 0) {
      alert(`No product found matching "${query}". Please check the spelling.`);
      return;
    }

    setFuzzyChange(change);

    if (matches.length === 1) {
      // Direct single match
      const matched = matches[0];
      const newStock = Math.max(0, matched.stockCount + change);
      setQuickStockPreview({
        product: matched,
        change,
        newStock
      });
    } else {
      // Disambiguation selection needed
      setFuzzyMatches(matches);
    }
  };

  const selectFuzzyMatch = (product: Product) => {
    const newStock = Math.max(0, product.stockCount + fuzzyChange);
    setQuickStockPreview({
      product,
      change: fuzzyChange,
      newStock
    });
    setFuzzyMatches([]);
  };

  const handleQuickStockConfirm = async () => {
    if (!quickStockPreview) return;
    const { product, change } = quickStockPreview;
    
    try {
      const res = await fetch('/api/admin/stock-adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity: change,
          reason: 'manual_audit',
          notes: 'Fuzzy quick stock adjustment',
          batchNumber: product.batchNumber || null
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setProducts(prev => prev.map(p => p.id === product.id ? data.product : p));
        setStockAdjustments(prev => [data.adjustment, ...prev]);
        
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

  // Styles for modal
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)'
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '4px',
    width: '460px',
    maxWidth: '90%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    border: '1px solid var(--admin-border)'
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
              <label>Initial Batch Number (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Batch #042" 
                className="form-control"
                value={newProduct.batchNumber}
                onChange={e => setNewProduct({...newProduct, batchNumber: e.target.value})}
              />
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

      {/* Fuzzy Stock Widget & Database Activity Log Feed Block */}
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

          {/* Multiple matches disambiguation list */}
          {fuzzyMatches.length > 0 && (
            <div style={{ marginTop: '16px', padding: '16px', border: '1px solid var(--admin-border)', backgroundColor: '#F9F9F9' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--admin-maroon)' }}>Multiple matches found. Select correct item:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {fuzzyMatches.map(p => (
                  <button 
                    key={p.id}
                    onClick={() => selectFuzzyMatch(p)}
                    style={{
                      padding: '10px',
                      border: '1px solid var(--admin-border)',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: '600'
                    }}
                  >
                    🎯 {p.name} (Current Stock: {p.stockCount})
                  </button>
                ))}
              </div>
            </div>
          )}

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
          <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>📜 Stock Movement History (Database)</h3>
          <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
            Persistent historical audit log of inventory changes.
          </p>
          
          <div className="inventory-stock-log" style={{ maxHeight: '200px' }}>
            {stockAdjustments.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--admin-muted)', fontSize: '0.85rem' }}>
                No stock logs stored in database.
              </div>
            ) : (
              stockAdjustments.map(log => {
                const dateStr = new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                return (
                  <div key={log.id} className="inventory-log-row">
                    <span style={{ fontSize: '0.9rem' }}>
                      <strong>{log.productName}</strong>: {log.quantity > 0 ? `+${log.quantity}` : log.quantity} ({log.reason.replace('_', ' ')})
                      {log.notes && <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--admin-muted)' }}>Note: {log.notes}</span>}
                    </span>
                    <span style={{ color: 'var(--admin-muted)', fontSize: '0.75rem' }}>{dateStr}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Products list */}
      <div className="admin-products-list">
        {products.map(product => {
          const burnRateInfo = getBurnRateMetrics(product.id);
          return (
            <ProductRow 
              key={product.id} 
              product={product} 
              onToggleStatus={() => handleToggleStockStatus(product)}
              onUpdatePrice={(price) => handleUpdatePrice(product.id, price)}
              onUpdateStock={(targetQty) => openAdjustmentModal(product, targetQty)}
              onUpdateBatch={(batchNum) => handleUpdateBatchInfo(product.id, batchNum)}
              onDelete={() => handleDeleteProduct(product.id, product.name)}
              dailyBurnRate={burnRateInfo.dailyBurnRate}
            />
          );
        })}
      </div>

      {/* Manual Adjustment Reason-based Modal */}
      {activeAdjProduct && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--admin-maroon)', borderBottom: '1px solid var(--admin-border)', paddingBottom: '12px', marginBottom: '16px' }}>
              📝 Log Inventory Adjustment
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '14px' }}>
              Product: <strong>{activeAdjProduct.name}</strong><br />
              Adjustment: <strong>{activeAdjProduct.stockCount}</strong> &rarr; <strong>{adjTargetStock}</strong> ({adjTargetStock - activeAdjProduct.stockCount > 0 ? '+' : ''}{adjTargetStock - activeAdjProduct.stockCount} jars)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)' }}>Adjustment Reason *</label>
                <select 
                  className="form-control" 
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                >
                  <option value="manual_audit">Inventory Audit / Correction</option>
                  <option value="batch_cooked">Batch Cooked (New stock)</option>
                  <option value="waste">Damaged / Wasted / Expiration</option>
                  <option value="sale">Manual offline sale</option>
                  <option value="other">Other / Miscellaneous</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)' }}>Batch Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Batch #042"
                  value={adjBatchNumber}
                  onChange={e => setAdjBatchNumber(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--admin-muted)' }}>Operational Notes</label>
                <textarea 
                  rows={3}
                  className="form-control" 
                  placeholder="Optional details e.g., cooked in large sun pot, drop jar in store..."
                  value={adjNotes}
                  onChange={e => setAdjNotes(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--admin-border)', paddingTop: '16px' }}>
              <button 
                onClick={() => setActiveAdjProduct(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ECECEC',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmManualAdjustment}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--admin-maroon)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                💾 Save Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProductRowProps {
  product: Product; 
  onToggleStatus: () => void; 
  onUpdatePrice: (price: number) => void; 
  onUpdateStock: (count: number) => void; 
  onUpdateBatch: (batchNumber: string) => void;
  onDelete: () => void; 
  dailyBurnRate: number;
}

function ProductRow({ 
  product, 
  onToggleStatus, 
  onUpdatePrice, 
  onUpdateStock, 
  onUpdateBatch,
  onDelete,
  dailyBurnRate
}: ProductRowProps) {
  const [localPrice, setLocalPrice] = useState(product.price.toString());
  const [localStock, setLocalStock] = useState(product.stockCount.toString());
  const [localBatchNum, setLocalBatchNum] = useState(product.batchNumber || '');

  // Calculate predictive stock warning days remaining
  const daysRemaining = dailyBurnRate > 0 ? product.stockCount / dailyBurnRate : null;

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
          
          {/* Batch aware context */}
          <div style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', display: 'flex', gap: '15px', marginTop: '6px' }}>
            <span>Batch: <strong>{product.batchNumber || 'N/A'}</strong></span>
            {product.batchDate && (
              <span>Batch Date: <strong>{new Date(product.batchDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
            )}
          </div>

          {/* Rolling burn rate prediction badges */}
          <div style={{ marginTop: '10px' }}>
            {daysRemaining !== null ? (
              daysRemaining <= 3 ? (
                <span style={{ 
                  backgroundColor: 'var(--admin-maroon-light)', 
                  color: 'var(--admin-maroon)', 
                  padding: '4px 10px', 
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: '1px solid rgba(154, 44, 44, 0.2)'
                }}>
                  🚨 Run Out Warning: ~{Math.round(daysRemaining)} days left! (Burn: {dailyBurnRate.toFixed(1)} jars/day)
                </span>
              ) : daysRemaining <= 7 ? (
                <span style={{ 
                  backgroundColor: '#FFF2E0', 
                  color: '#B57C1E', 
                  padding: '4px 10px', 
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  border: '1px solid rgba(181, 124, 30, 0.2)'
                }}>
                  ⚠️ Low Stock Warning: ~{Math.round(daysRemaining)} days left (Burn: {dailyBurnRate.toFixed(1)} jars/day)
                </span>
              ) : (
                <span style={{ 
                  backgroundColor: 'var(--admin-success-light)', 
                  color: 'var(--admin-success)', 
                  padding: '4px 10px', 
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  🟢 Stock Stable: ~{Math.round(daysRemaining)} days left (Burn: {dailyBurnRate.toFixed(1)} jars/day)
                </span>
              )
            ) : (
              product.stockCount < 10 ? (
                <span style={{ 
                  backgroundColor: '#ECECEC', 
                  color: '#555555', 
                  padding: '4px 10px', 
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  🟡 Low Stock: {product.stockCount} jars left (No recent sales)
                </span>
              ) : (
                <span style={{ 
                  backgroundColor: 'var(--admin-success-light)', 
                  color: 'var(--admin-success)', 
                  padding: '4px 10px', 
                  borderRadius: '3px',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  🟢 Stock Healthy
                </span>
              )
            )}
          </div>
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

          {/* Batch Number Editor */}
          <div className="edit-control-item">
            <label className="edit-control-label">Active Batch</label>
            <div className="edit-input-group">
              <input 
                type="text" 
                className="edit-input-box" 
                value={localBatchNum} 
                onChange={e => setLocalBatchNum(e.target.value)} 
                placeholder="e.g. Batch #042"
              />
              <button 
                className="btn-save-inline"
                onClick={() => onUpdateBatch(localBatchNum.trim())}
              >
                Save
              </button>
            </div>
          </div>

          {/* Toggle Stock Status */}
          <div className="edit-control-item" style={{ minWidth: '130px' }}>
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
