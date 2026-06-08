"use client";
import React, { useState } from 'react';
import { Product, Order } from '../AdminClient';
import { TabType } from './AdminShell';

interface PlannerTabProps {
  products: Product[];
  orders: Order[];
  setActiveTab: (tab: TabType) => void;
}

export default function PlannerTab({ products, orders, setActiveTab }: PlannerTabProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  // Pending jars calculation
  const pendingJarsCount = orders
    .filter(o => !['DELIVERED', 'CANCELLED'].includes(o.status))
    .reduce((sum, o) => {
      const item = o.items.find(i => i.productId === selectedProductId);
      return sum + (item ? item.quantity : 0);
    }, 0);

  const netProductionNeeded = pendingJarsCount - (selectedProduct?.stockCount || 0);
  const suggestedBatchSize = netProductionNeeded > 0
    ? Math.ceil((netProductionNeeded * 1.2) / 5) * 5
    : 0;

  return (
    <div className="admin-section">
      <div className="admin-premium-card" style={{ marginBottom: '24px' }}>
        <h3 className="admin-card-title-lux" style={{ marginBottom: '8px' }}>🥣 Today&apos;s Production Planner (Beta)</h3>
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Select a pickle from the catalogue to calculate recommended daily kitchen batch volumes, accounting for pending customer checkouts and safety margins.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <div className="form-group">
              <label>Select Target Pickle</label>
              <select 
                className="form-control"
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                style={{ fontSize: '1.1rem', padding: '12px' }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div style={{ padding: '20px', backgroundColor: '#FAFAFA', border: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-muted)' }}>Pending Customer Order Jars:</span>
                  <strong>{pendingJarsCount} Jars</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--admin-muted)' }}>Current Inventory Shelf Stock:</span>
                  <strong>{selectedProduct.stockCount} Jars</strong>
                </div>
              </div>
            )}
          </div>

          <div style={{ borderLeft: '1px solid var(--admin-border)', paddingLeft: '40px', textAlign: 'center' }}>
            {suggestedBatchSize > 0 ? (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-maroon)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                  SUGGESTED BATCH SIZE
                </span>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--admin-text)', lineHeight: '1.2' }}>
                  Make {suggestedBatchSize} Jars
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', display: 'block', marginTop: '8px' }}>
                  Includes 20% safety margin buffer (rounded up to nearest 5)
                </span>
              </div>
            ) : (
              <div style={{ color: 'var(--admin-success)', fontWeight: '700', fontSize: '1.2rem', padding: '20px' }}>
                🟢 Sufficiently Stocked! No batch needed today for {selectedProduct?.name}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Production Planner Placeholder Info */}
      <div className="admin-premium-card" style={{ borderStyle: 'dashed', backgroundColor: 'transparent' }}>
        <h3 className="admin-card-title-lux" style={{ marginBottom: '12px' }}>🚀 Future Planner Upgrades</h3>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--admin-muted)', marginBottom: '16px' }}>
          Phase 3 will introduce predictive batch ordering, multi-day scheduling, direct ingredient list calculators (e.g. required weight of raw mangoes and spices), and automated kitchen task sheets synced dynamically based on delivery driver dispatch schedules.
        </p>
        <button 
          onClick={() => setActiveTab('kitchen')} 
          className="admin-logout-btn"
          style={{ padding: '8px 16px' }}
        >
          View Kitchen prep list instead &rarr;
        </button>
      </div>
    </div>
  );
}
