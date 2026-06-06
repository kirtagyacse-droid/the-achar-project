"use client";
import React, { useState } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import JarSizeSelector from '@/components/JarSizeSelector';
import FlavorRadar from '@/components/FlavorRadar';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stockStatus: string;
  category: string;
  spiciness?: number;
  sizes?: any;
  batchNumber?: string | null;
  batchDate?: Date | string | null;
  tastingNotes?: string | null;
  flavorProfile?: any;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showTastingNotes, setShowTastingNotes] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [passportPhone, setPassportPhone] = useState('');
  const [passportError, setPassportError] = useState('');
  const [passportSuccess, setPassportSuccess] = useState('');
  const [passportLoading, setPassportLoading] = useState(false);

  const handleStampPassport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportPhone) return;
    setPassportLoading(true);
    setPassportError('');
    setPassportSuccess('');
    try {
      const response = await fetch('/api/passport/stamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: passportPhone, productId: product.id })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to stamp');
      }
      setPassportSuccess(data.message || 'Product stamped successfully!');
      setTimeout(() => {
        setShowPassportModal(false);
        setPassportSuccess('');
        setPassportPhone('');
      }, 2500);
    } catch (err: any) {
      setPassportError(err.message || 'Error occurred while stamping.');
    } finally {
      setPassportLoading(false);
    }
  };

  // Parse sizes array
  const parsedSizes = Array.isArray(product.sizes)
    ? product.sizes
    : typeof product.sizes === 'string'
    ? JSON.parse(product.sizes)
    : [];

  const hasSizes = parsedSizes.length > 0;
  
  const [selectedSize, setSelectedSize] = useState(hasSizes ? parsedSizes[0].label : '');
  const [selectedPrice, setSelectedPrice] = useState(hasSizes ? parsedSizes[0].price : product.price);

  const handleAddToCart = () => {
    const cartItemId = selectedSize ? `${product.id}-${selectedSize}` : product.id;
    const item: CartItem = {
      id: cartItemId,
      productId: product.id,
      name: selectedSize ? `${product.name} (${selectedSize})` : product.name,
      price: selectedPrice,
      quantity: quantity,
      imageUrl: product.imageUrl || '',
      sizeLabel: selectedSize || undefined
    };
    addToCart(item);
  };

  return (
    <div className="product-detail-container">
      <div className="container">
        <Link href="/products" className="back-link">
          &larr; Back to Shop
        </Link>
        
        <div className="product-detail-grid">
          <div className="product-detail-image-wrap">
            <div 
              className="product-detail-image"
              style={{ backgroundImage: `url(${product.imageUrl || '/placeholder.png'})` }}
            />
          </div>
          
          <div className="product-detail-info">
            <span className="product-detail-tag">Jaipur Artisanal Pickle</span>
            
            {/* Batch Edition Badge */}
            {product.batchNumber && (
              <div className="batch-badge-pill" style={{ marginTop: '8px' }}>
                <Sparkles size={12} strokeWidth={2.5} style={{ color: '#7B1C1C' }} />
                <span>
                  {product.batchNumber} 
                  {product.batchDate && ` · Made ${new Date(product.batchDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
                </span>
              </div>
            )}

            <h1 className="product-detail-title" style={{ marginTop: '4px' }}>{product.name}</h1>
            <div className="product-detail-price">₹{selectedPrice}</div>
            
            {hasSizes && (
              <JarSizeSelector
                sizes={parsedSizes}
                selectedSize={selectedSize}
                onSizeSelect={(size) => {
                  setSelectedSize(size.label);
                  setSelectedPrice(size.price);
                }}
              />
            )}
            
            <div className="product-detail-status" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '10px' }}>
              <div>
                Status: <span className={product.stockStatus === 'IN_STOCK' ? 'status-in' : 'status-out'}>
                  {product.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {product.spiciness !== undefined && product.spiciness > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Spiciness:</span>
                  <span title={`Spiciness: ${product.spiciness}/3`}>
                    {Array(product.spiciness).fill('🌶️').join('')}
                  </span>
                </div>
              )}
            </div>

            {/* Flavor Profile Chart */}
            {product.flavorProfile && (
              <FlavorRadar profile={product.flavorProfile} />
            )}
            
            <div className="product-detail-divider"></div>
            
            <p className="product-detail-desc">{product.description}</p>

            {/* Tasting Notes Collapsible Panel */}
            {product.tastingNotes && (
              <div className="tasting-notes-disclosure">
                <button 
                  type="button" 
                  className="tasting-notes-trigger"
                  onClick={() => setShowTastingNotes(!showTastingNotes)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🍷 Tasting Notes
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {showTastingNotes ? 'Read tasting notes ▴' : 'Read tasting notes ▾'}
                  </span>
                </button>
                {showTastingNotes && (
                  <div className="tasting-notes-content">
                    <blockquote className="tasting-notes-quote">
                      "{product.tastingNotes}"
                    </blockquote>
                    <span className="tasting-notes-attribution">— Aunty's own words</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="product-detail-divider"></div>
            
            <div className="product-detail-meta">
              <div className="meta-item">
                <strong>Ingredients:</strong> Local handpicked ingredients, cold-pressed mustard oil, fenugreek, fennel, mustard seeds, turmeric, salt, asafoetida.
              </div>
              <div className="meta-item">
                <strong>Care:</strong> Store in a dry place. Keep jar tightly sealed and submerged in oil.
              </div>
            </div>
            
            {product.stockStatus === 'IN_STOCK' ? (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div className="product-detail-purchase">
                  <div className="quantity-selector-wrap">
                    <label>Quantity:</label>
                    <div className="quantity-selector">
                      <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
                      <span>{quantity}</span>
                      <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
                    </div>
                  </div>
                  
                  <button className="product-detail-btn" onClick={handleAddToCart}>
                    Add to Cart
                  </button>
                </div>
                
                <a 
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent(`Hi! I would like to order ${quantity} jar(s) of ${product.name}${selectedSize ? ` (${selectedSize})` : ''} (₹${selectedPrice} each) from RS Savoury. Please confirm delivery.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-order"
                >
                  💬 Order on WhatsApp
                </a>

                <button 
                  type="button"
                  onClick={() => setShowPassportModal(true)}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '12px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    border: '1px dashed var(--color-accent)',
                    color: 'var(--color-accent)',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                >
                  🎴 Add to my Passport
                </button>
              </div>
            ) : (
              <div className="out-of-stock-msg">
                This item is currently out of stock. Check back later!
              </div>
            )}
          </div>
        </div>
      </div>

      {showPassportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '30px',
            backgroundColor: 'var(--bg-primary)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-light)',
            position: 'relative'
          }}>
            <button 
              type="button"
              onClick={() => { setShowPassportModal(false); setPassportError(''); setPassportSuccess(''); }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                fontSize: '1.5rem',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                background: 'none',
                border: 'none'
              }}
            >
              &times;
            </button>
            <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--color-accent)' }}>
              Stamps Passport
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Add a stamp for <strong>{product.name}</strong> to your Pickle Passport to track your loyalty progress.
            </p>

            {passportSuccess ? (
              <div style={{ color: 'var(--color-success)', padding: '10px', backgroundColor: 'var(--color-success-light)', border: '1px solid rgba(27,94,32,0.1)', fontSize: '0.95rem', textAlign: 'center' }}>
                {passportSuccess}
              </div>
            ) : (
              <form onSubmit={handleStampPassport}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>Phone Number</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="Enter phone number linked to passport" 
                    className="form-control"
                    value={passportPhone}
                    onChange={e => setPassportPhone(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px' }}
                  />
                </div>
                {passportError && (
                  <div style={{ color: '#7B1C1C', padding: '10px', backgroundColor: 'var(--color-accent-light)', border: '1px solid rgba(123,28,28,0.1)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    {passportError}
                    {passportError.includes('register') && (
                      <div style={{ marginTop: '8px' }}>
                        <Link href="/passport" onClick={() => setShowPassportModal(false)} style={{ textDecoration: 'underline', fontWeight: 600, color: 'var(--color-accent)' }}>
                          Create your passport first &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                <button type="submit" className="btn-lux-primary" style={{ width: '100%', margin: 0 }} disabled={passportLoading}>
                  {passportLoading ? 'Stamping...' : 'Submit Stamp'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


