"use client";
import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import { useGiftingMode } from '@/context/GiftingModeContext';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  description: string;
  isGiftReady?: boolean;
}

interface FestivalBundle {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string | null;
  productIds: string[];
  packagingStyle?: string;
  isPrebuilt: boolean;
  isPublished: boolean;
}

export default function GiftBuilderPage() {
  const { addToCart, setCartOpen } = useCart();
  const { setGiftMessage, setGiftPackaging, toggleGiftingMode, isGiftingMode } = useGiftingMode();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<FestivalBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  // Selection States
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [packaging, setPackaging] = useState<'cloth-wrap' | 'wooden-crate'>('cloth-wrap');
  const [messageText, setMessageText] = useState('');
  const [occasion, setOccasion] = useState('Festive Celebration');

  useEffect(() => {
    // Fetch products and bundles
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/bundles').then(res => res.json()).catch(() => ({ bundles: [] }))
    ]).then(([productsData, bundlesData]) => {
      if (productsData) {
        setProducts(productsData.filter((p: Product) => p.name !== "Aunty&apos;s Starter Trio"));
      }
      if (bundlesData?.bundles) {
        setBundles(bundlesData.bundles.filter((b: FestivalBundle) => b.isPublished));
      }
    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        if (prev.length >= 6) {
          alert("A gift box can hold up to 6 jars maximum.");
          return prev;
        }
        return [...prev, productId];
      }
    });
  };

  const handleSelectBundle = (bundle: FestivalBundle) => {
    setSelectedProductIds(bundle.productIds);
    setPackaging((bundle.packagingStyle as 'cloth-wrap' | 'wooden-crate') || 'cloth-wrap');
    setOccasion(bundle.name);
  };

  const getSelectedProducts = () => {
    return products.filter(p => selectedProductIds.includes(p.id));
  };

  const getGiftReadyProducts = () => {
    return products.filter(p => p.isGiftReady);
  };

  const getPackagingLabel = () => {
    return packaging === 'cloth-wrap' ? 'Classic Cotton Wrap' : 'Premium Wooden Crate';
  };

  const getPackagingPrice = () => {
    return packaging === 'wooden-crate' ? 150 : 0;
  };

  const getJarsTotal = () => {
    return getSelectedProducts().reduce((sum, p) => sum + p.price, 0);
  };

  const getGrandTotal = () => {
    return getJarsTotal() + getPackagingPrice();
  };

  const handleShareGiftPreview = () => {
    const params = new URLSearchParams({
      occasion,
      packaging,
      total: getGrandTotal().toString()
    });
    const shareUrl = `${window.location.origin}/api/og/gift?${params}`;
    if (navigator.share) {
      navigator.share({
        title: 'My RS Savoury Gift Box',
        text: `Check out this premium pickle gift box I curated for ${occasion}!`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  const handleAddToCart = () => {
    const selected = getSelectedProducts();
    if (selected.length < 2 || selected.length > 6) return;

    // 1. Activate Gifting Mode
    if (!isGiftingMode) {
      toggleGiftingMode();
    }
    // 2. Save packaging and message in context
    setGiftPackaging(packaging);
    setGiftMessage(messageText);

    // 3. Add all selected products to cart
    selected.forEach(prod => {
      const item: CartItem = {
        id: prod.id,
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: 1,
        imageUrl: prod.imageUrl || ''
      };
      addToCart(item);
    });

    // 4. Open Cart Drawer and redirect
    setCartOpen(true);
    router.push('/products');
  };

  const nextStep = () => {
    if (step === 1 && selectedProductIds.length < 2) {
      alert("Please select at least 2 pickles to build a gift box.");
      return;
    }
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '8px' }}>Preparing the gift builder...</h3>
        <p style={{ color: 'var(--text-muted)' }}>Loading curated pickle bundles for you.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{ fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 600 }}>
          CURATED GIFTING
        </span>
        <h1 className="font-handwriting" style={{ fontSize: '4.5rem', margin: '10px 0 15px', color: 'var(--text-main)', lineHeight: 1.1 }}>
          Festival Bundle Builder
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Choose curated festival bundles or build your own custom gift box with Jaipur&apos;s finest artisanal pickles.
        </p>
      </div>

      {/* Festival Bundles Showcase */}
      {bundles.length > 0 && (
        <div style={{ marginBottom: '50px' }}>
          <h3 className="heading-serif" style={{ fontSize: '1.6rem', marginBottom: '24px', textAlign: 'center' }}>
            🎉 Curated Festival Bundles ({bundles.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {bundles.map(bundle => (
              <div key={bundle.id} className="card" style={{
                padding: '24px',
                border: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }} onClick={() => handleSelectBundle(bundle)}>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>{bundle.name}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, flexGrow: 1 }}>
                  {bundle.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--color-accent-light)', padding: '4px 8px', borderRadius: '2px', color: 'var(--color-accent)' }}>
                    {bundle.productIds.length} jars
                  </span>
                  <button className="btn-lux-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                    Use Bundle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar / Steps Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '20px', marginBottom: '40px' }}>
        {[1, 2, 3, 4].map(s => (
          <div key={s} style={{ 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            color: step === s ? 'var(--color-accent)' : 'var(--text-muted)',
            borderBottom: step === s ? '2px solid var(--color-accent)' : 'none',
            paddingBottom: '8px',
            marginBottom: '-21px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Step {s}: {s === 1 ? 'Choose Pickles' : s === 2 ? 'Select Wrap' : s === 3 ? 'Gift Note' : 'Review'}
          </div>
        ))}
      </div>

      {/* Step 1: Choose 2-6 Jars */}
      {step === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
            <h3 className="heading-serif" style={{ fontSize: '1.6rem' }}>Select 2 to 6 pickles ({selectedProductIds.length} chosen)</h3>
            <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Running Total: <strong>₹{getJarsTotal()}</strong></span>
          </div>

          {/* Gift-Ready Products Section */}
          {getGiftReadyProducts().length > 0 && (
            <div style={{ marginBottom: '30px' }}>
<h4 className="heading-serif" style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--color-accent)' }}>
                 🏆 Best For Gifting
               </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {getGiftReadyProducts().map(product => {
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <div 
                      key={product.id}
                      onClick={() => handleProductToggle(product.id)}
                      style={{
                        position: 'relative',
                        border: isSelected ? '2.5px solid var(--color-accent)' : '1px solid var(--border-medium)',
                        padding: '16px',
                        backgroundColor: isSelected ? 'var(--color-accent-light)' : 'white',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundImage: `url(${product.imageUrl || '/placeholder.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        marginBottom: '12px',
                        border: '1px solid var(--border-light)'
                      }} />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>{product.name}</h4>
                      <strong style={{ color: 'var(--color-accent)', fontSize: '1rem' }}>₹{product.price}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {products.map(product => {
              const isSelected = selectedProductIds.includes(product.id);
              return (
                <div 
                  key={product.id}
                  onClick={() => handleProductToggle(product.id)}
                  style={{
                    position: 'relative',
                    border: isSelected ? '2.5px solid var(--color-accent)' : '1px solid var(--border-medium)',
                    padding: '20px',
                    backgroundColor: isSelected ? 'var(--color-accent-light)' : 'white',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  {product.isGiftReady && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'var(--color-accent)',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Gift-Ready
                    </div>
                  )}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundImage: `url(${product.imageUrl || '/placeholder.png'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    marginBottom: '16px',
                    border: '1px solid var(--border-light)',
                    position: 'relative'
                  }}>
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(123, 28, 28, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        borderRadius: '50%'
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                  
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{product.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexGrow: 1, marginBottom: '12px' }}>{product.description}</p>
                  <strong style={{ color: 'var(--color-accent)', fontSize: '1.1rem' }}>₹{product.price}</strong>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'right' }}>
            <button onClick={nextStep} className="btn-lux-primary" disabled={selectedProductIds.length < 2}>
              Next: Choose Packaging &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Choose Packaging Style */}
      {step === 2 && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className="heading-serif" style={{ fontSize: '1.8rem', marginBottom: '24px', textAlign: 'center' }}>Choose Packaging Wrap</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
            {/* Cotton Wrap */}
            <label style={{
              display: 'flex',
              padding: '24px',
              border: packaging === 'cloth-wrap' ? '2px solid var(--color-accent)' : '1px solid var(--border-medium)',
              backgroundColor: packaging === 'cloth-wrap' ? 'var(--color-accent-light)' : 'transparent',
              borderRadius: '2px',
              cursor: 'pointer',
              alignItems: 'center',
              gap: '20px'
            }}>
              <input type="radio" name="packaging" checked={packaging === 'cloth-wrap'} onChange={() => setPackaging('cloth-wrap')} style={{ display: 'none' }} />
              <div style={{ fontSize: '2.5rem' }}>🫙</div>
              <div style={{ flexGrow: 1 }}>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'block' }}>Classic Cotton Wrap</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Free of cost. Eco-friendly traditional cotton wrapping box.</span>
              </div>
              <strong style={{ fontSize: '1.1rem' }}>₹0</strong>
            </label>

            {/* Wooden Crate */}
            <label style={{
              display: 'flex',
              padding: '24px',
              border: packaging === 'wooden-crate' ? '2px solid var(--color-accent)' : '1px solid var(--border-medium)',
              backgroundColor: packaging === 'wooden-crate' ? 'var(--color-accent-light)' : 'transparent',
              borderRadius: '2px',
              cursor: 'pointer',
              alignItems: 'center',
              gap: '20px'
            }}>
              <input type="radio" name="packaging" checked={packaging === 'wooden-crate'} onChange={() => setPackaging('wooden-crate')} style={{ display: 'none' }} />
              <div style={{ fontSize: '2.5rem' }}>📦</div>
              <div style={{ flexGrow: 1 }}>
                <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'block' }}>Premium Wooden Crate</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Handcrafted wooden chest for that premium royal luxury feel.</span>
              </div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--color-accent)' }}>+₹150</strong>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={prevStep} className="btn-lux-secondary">
              &larr; Back
            </button>
            <button onClick={nextStep} className="btn-lux-primary">
              Next: Add Gift Message &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Personalized Message */}
      {step === 3 && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3 className="heading-serif" style={{ fontSize: '1.8rem', marginBottom: '16px', textAlign: 'center' }}>Add a Personal Message</h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>
            We&apos;ll print this letter on a handcrafted sheet of cardstock to place inside the box. (Optional)
          </p>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <textarea
              maxLength={200}
              placeholder="E.g. Dear Amit, hope you enjoy these pickles made with generational love from Jaipur. Happy Birthday!"
              rows={4}
              className="form-control"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', border: '1px solid var(--border-medium)', resize: 'none' }}
            />
            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '8px' }}>
              {messageText.length} / 200 characters
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={prevStep} className="btn-lux-secondary">
              &larr; Back
            </button>
            <button onClick={nextStep} className="btn-lux-primary">
              Next: Review Box &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review and Add to Cart */}
      {step === 4 && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h3 className="heading-serif" style={{ fontSize: '1.8rem', marginBottom: '24px', textAlign: 'center' }}>Review Your Gift Box</h3>
          
          <div className="card" style={{ padding: '30px', border: '1px solid var(--border-light)', backgroundColor: '#F9F9F9', marginBottom: '30px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Selected Jars</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getSelectedProducts().map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                    <span>1x {p.name}</span>
                    <span>₹{p.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px', borderTop: '1px solid #EAEAEA', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Packaging Style</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{getPackagingLabel()}</span>
                <span>₹{getPackagingPrice()}</span>
              </div>
            </div>

            {messageText.trim() && (
              <div style={{ marginBottom: '24px', borderTop: '1px solid #EAEAEA', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Gift Note Message</h4>
                <blockquote style={{ fontStyle: 'italic', color: 'var(--text-muted)', borderLeft: '3px solid var(--color-accent)', paddingLeft: '16px', margin: 0, fontSize: '0.95rem' }}>
                  "{messageText}"
                </blockquote>
              </div>
            )}

            <div style={{ borderTop: '2px solid var(--text-main)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 'bold' }}>
              <span>Total Price</span>
              <span style={{ color: 'var(--color-accent)' }}>₹{getGrandTotal()}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={prevStep} className="btn-lux-secondary" style={{ flex: 1 }}>
                &larr; Back
              </button>
              <button onClick={handleShareGiftPreview} className="btn-lux-secondary" style={{ flex: 1, backgroundColor: '#38A169', borderColor: '#38A169', color: 'white' }}>
                📱 Share Preview
              </button>
            </div>
            <button onClick={handleAddToCart} className="btn-lux-primary" style={{ width: '100%' }}>
              🎁 Add Gift Box to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}