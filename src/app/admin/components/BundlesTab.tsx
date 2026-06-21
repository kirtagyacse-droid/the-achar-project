"use client";
import React, { useState } from 'react';
import { Product, FestivalBundle } from '../AdminClient';

interface BundlesTabProps {
  products: Product[];
  bundles: FestivalBundle[];
  setBundles: React.Dispatch<React.SetStateAction<FestivalBundle[]>>;
}

export default function BundlesTab({ products, bundles, setBundles }: BundlesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bundleForm, setBundleForm] = useState({
    name: '',
    slug: '',
    description: '',
    coverImage: '',
    productIds: [] as string[],
    packagingStyle: 'cloth-wrap' as 'cloth-wrap' | 'wooden-crate',
    isPublished: true
  });

  const handleSelectProduct = (productId: string) => {
    setBundleForm(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  const handleCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleForm.name || bundleForm.productIds.length < 2) {
      setErrorMsg('Name and at least 2 products are required');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    
    const slug = bundleForm.slug || bundleForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const res = await fetch('/api/admin/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bundleForm,
          slug,
          productIds: bundleForm.productIds
        })
      });
      const data = await res.json();

      if (res.ok) {
        setBundles([data.bundle, ...bundles]);
        setBundleForm({ name: '', slug: '', description: '', coverImage: '', productIds: [], packagingStyle: 'cloth-wrap', isPublished: true });
        setShowForm(false);
      } else {
        setErrorMsg(data.message || 'Failed to create bundle');
      }
    } catch (err) {
      console.error('Error creating bundle', err);
      setErrorMsg('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBundle = async (bundleId: string) => {
    try {
      const res = await fetch(`/api/admin/bundles/${bundleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !bundles.find(b => b.id === bundleId)?.isPublished })
      });
      const data = await res.json();

      if (res.ok) {
        setBundles(bundles.map(b => b.id === bundleId ? data.bundle : b));
      }
    } catch (err) {
      console.error('Error updating bundle', err);
    }
  };

  const handleDeleteBundle = async (bundleId: string) => {
    if (!confirm('Are you sure you want to permanently delete this festival bundle?')) return;

    try {
      const res = await fetch(`/api/admin/bundles/${bundleId}`, { method: 'DELETE' });
      if (res.ok) {
        setBundles(bundles.filter(b => b.id !== bundleId));
      }
    } catch (err) {
      console.error('Error deleting bundle', err);
    }
  };

  return (
    <div className="admin-section">
      <div className="admin-premium-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 className="admin-card-title-lux" style={{ marginBottom: '4px' }}>🎁 Festival Bundles Manager</h3>
            <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem', margin: 0 }}>
              Curate festival-ready jar combinations for the gift builder
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-submit-pickle"
            style={{ padding: '10px 20px' }}
          >
            {showForm ? '✕ Cancel' : '+ New Bundle'}
          </button>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--admin-maroon-light)',
            border: '1px solid rgba(154, 44, 44, 0.15)',
            color: 'var(--admin-maroon)',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '0.9rem',
            borderRadius: '4px'
          }}>
            {errorMsg}
          </div>
        )}

        {showForm && (
          <div style={{ border: '1px solid var(--admin-border)', padding: '24px', marginBottom: '24px', backgroundColor: '#FAFAFA' }}>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 600 }}>
              Create New Festival Bundle
            </h4>
            <form onSubmit={handleCreateBundle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Bundle Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Celebration Box"
                  className="form-control"
                  value={bundleForm.name}
                  onChange={e => setBundleForm({ ...bundleForm, name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Custom Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="Auto-generated from name if empty"
                  className="form-control"
                  value={bundleForm.slug}
                  onChange={e => setBundleForm({ ...bundleForm, slug: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe this festival bundle..."
                  className="form-control"
                  value={bundleForm.description}
                  onChange={e => setBundleForm({ ...bundleForm, description: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Packaging Style</label>
                <select
                  className="form-control"
                  value={bundleForm.packagingStyle}
                  onChange={e => setBundleForm({ ...bundleForm, packagingStyle: e.target.value as 'cloth-wrap' | 'wooden-crate' })}
                  disabled={loading}
                >
                  <option value="cloth-wrap">Cloth Wrap</option>
                  <option value="wooden-crate">Wooden Crate</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  Select Products ({bundleForm.productIds.length} selected)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', maxHeight: '200px', overflowY: 'auto', padding: '8px', border: '1px solid var(--admin-border)', borderRadius: '2px' }}>
                  {products.map(p => (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', backgroundColor: bundleForm.productIds.includes(p.id) ? 'var(--admin-maroon-light)' : 'white', border: '1px solid var(--admin-border)', borderRadius: '2px' }}>
                      <input
                        type="checkbox"
                        checked={bundleForm.productIds.includes(p.id)}
                        onChange={() => handleSelectProduct(p.id)}
                        disabled={loading}
                      />
                      <span style={{ fontSize: '0.85rem' }}>{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="is-published-chk-bundle"
                  checked={bundleForm.isPublished}
                  onChange={e => setBundleForm({ ...bundleForm, isPublished: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  disabled={loading}
                />
                <label htmlFor="is-published-chk-bundle" style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', textTransform: 'none' }}>
                  Publish immediately (visible in gift builder)
                </label>
              </div>

              <button type="submit" className="btn-submit-pickle" style={{ marginTop: '10px' }} disabled={loading}>
                {loading ? 'Saving...' : '💾 Save Bundle'}
              </button>
            </form>
          </div>
        )}

        {bundles.length === 0 ? (
          <p className="no-items-text">No festival bundles created yet. Click &ldquo;+ New Bundle&rdquo; to start curating!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bundles.map(bundle => (
              <div key={bundle.id} style={{ border: '1px solid var(--admin-border)', padding: '20px', borderRadius: '2px', backgroundColor: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>{bundle.name}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--admin-muted)', margin: '4px 0' }}>
                      {bundle.description || 'No description'}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>
                      Products: {bundle.productIds.length} jars • Packaging: {bundle.packagingStyle || 'Cloth wrap'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleUpdateBundle(bundle.id)}
                      style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: bundle.isPublished ? '#FED7D7' : '#C6F6D5', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      {bundle.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDeleteBundle(bundle.id)}
                      style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#FED7D7', color: '#9B2C2C', border: '1px solid #FEB2B2', borderRadius: '2px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}