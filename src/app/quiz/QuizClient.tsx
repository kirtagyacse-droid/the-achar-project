"use client";
import React, { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import { QUIZ_QUESTIONS, getRecommendedPickleName } from '@/lib/quizLogic';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stockStatus: string;
  spiciness: number;
  category: string;
  sizes?: any;
}

export default function QuizPage() {
  const { addToCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3, or 4 (results)
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendedProduct, setRecommendedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Fetch products client-side for matching
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/admin/products'); // Use public or admin list
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || data);
        }
      } catch (e) {
        console.error("Failed to load products for quiz matching:", e);
      }
    }
    fetchProducts();
  }, []);

  const handleOptionSelect = (optionValue: string) => {
    const updatedAnswers = { ...answers, [currentStep]: optionValue };
    setAnswers(updatedAnswers);

    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate results
      setLoading(true);
      setCurrentStep(4);
      
      const targetName = getRecommendedPickleName(updatedAnswers);
      
      // Allow a small delay for dramatic/premium effect
      setTimeout(() => {
        const matched = products.find(
          p => p.name.toLowerCase().includes(targetName.toLowerCase())
        );
        
        // Fallback to first product or mock if not loaded yet
        setRecommendedProduct(matched || products[0] || null);
        setLoading(false);
      }, 900);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setAddedToCart(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setAnswers({});
    setRecommendedProduct(null);
    setAddedToCart(false);
  };

  // Progress percentage
  const progressPercent = currentStep === 4 ? 100 : ((currentStep - 1) / 3) * 100;

  // Add to cart action
  const handleAddToCart = () => {
    if (!recommendedProduct) return;
    
    // Parse sizes if they exist
    const parsedSizes = Array.isArray(recommendedProduct.sizes)
      ? recommendedProduct.sizes
      : typeof recommendedProduct.sizes === 'string'
      ? JSON.parse(recommendedProduct.sizes)
      : [];
      
    const sizeLabel = parsedSizes.length > 0 ? parsedSizes[0].label : undefined;
    const price = parsedSizes.length > 0 ? parsedSizes[0].price : recommendedProduct.price;
    const cartItemId = sizeLabel ? `${recommendedProduct.id}-${sizeLabel}` : recommendedProduct.id;

    const item: CartItem = {
      id: cartItemId,
      productId: recommendedProduct.id,
      name: sizeLabel ? `${recommendedProduct.name} (${sizeLabel})` : recommendedProduct.name,
      price: price,
      quantity: 1,
      imageUrl: recommendedProduct.imageUrl || '',
      sizeLabel: sizeLabel
    };

    addToCart(item);
    setAddedToCart(true);
  };

  const handleShareQuiz = () => {
    if (!recommendedProduct) return;
    const params = new URLSearchParams({
      product: recommendedProduct.name,
      spice: 'Medium',
      profile: 'Perfect Match'
    });
    const shareUrl = `${window.location.origin}/api/og/quiz?${params}`;
    if (navigator.share) {
      navigator.share({
        title: 'My Perfect Pickle Match',
        text: `The Pickle Finder Quiz matched me with ${recommendedProduct.name}! Find your perfect pickle at RS Savoury.`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Share preview link copied to clipboard!');
    }
  };

  return (
    <div className="quiz-page-container">
      <div className="container" style={{ padding: '40px 0' }}>
        
        {/* Progress Bar */}
        <div className="quiz-progress-bar-container">
          <div 
            className="quiz-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* STEP 1, 2, 3 */}
        {currentStep <= 3 && (
          <div>
            {/* Back button */}
            {currentStep > 1 && (
              <button 
                type="button" 
                onClick={handleBack} 
                className="quiz-back-btn"
                style={{ marginBottom: '24px' }}
              >
                &larr; Back
              </button>
            )}

            {QUIZ_QUESTIONS.map((q) => {
              if (q.id !== currentStep) return null;
              return (
                <div key={q.id} className="quiz-step-content" style={{ animation: 'fadeInOverlay 0.3s ease' }}>
                  <h1 className="quiz-step-title">{q.question}</h1>
                  <p className="quiz-step-subtitle">{q.subtitle}</p>

                  <div className="quiz-options-list">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className="quiz-option-pill"
                        onClick={() => handleOptionSelect(opt.value)}
                      >
                        <span>{opt.label}</span>
                        <span style={{ fontSize: '1.2rem', color: '#7B1C1C' }}>&rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* LOADING STATE */}
        {currentStep === 4 && loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', animation: 'fadeInOverlay 0.3s ease' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px', animation: 'floatEmoji 2s infinite' }}>
              🥣
            </span>
            <h2 className="heading-serif" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>
              Aunty is selecting your perfect match...
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              Matching spices, heat profiles, and pairing textures.
            </p>
          </div>
        )}

        {/* RESULT PRESENTATION */}
        {currentStep === 4 && !loading && (
          <div style={{ animation: 'fadeInOverlay 0.4s ease' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>✨</span>
              <h1 className="quiz-result-heading">Your Perfect Match</h1>
              <p className="quiz-result-sub">Hand-selected based on your spice tolerance and pairing flavor mood.</p>
            </div>

            {recommendedProduct ? (
              <div 
                className="product-card" 
                style={{ 
                  maxWidth: '380px', 
                  margin: '0 auto 40px',
                  height: 'auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
              >
                {/* Result Image */}
                <div className="product-image-container" style={{ height: '320px' }}>
                  <div 
                    className="product-image"
                    style={{ 
                      backgroundImage: `url(${recommendedProduct.imageUrl || '/placeholder.png'})`,
                      height: '100%',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  {recommendedProduct.spiciness !== undefined && recommendedProduct.spiciness > 0 && (
                    <div className="product-spice-badge">
                      {Array(recommendedProduct.spiciness).fill('🌶️').join('')}
                    </div>
                  )}
                </div>

                {/* Details overlay */}
                <div style={{ padding: '24px', backgroundColor: '#fff', borderTop: '1px solid var(--border-light)' }}>
                  <h3 className="product-title-lux" style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
                    {recommendedProduct.name}
                  </h3>
                  <p className="product-desc-lux" style={{ height: 'auto', marginBottom: '20px', display: 'block', WebkitLineClamp: 'none' }}>
                    {recommendedProduct.description}
                  </p>

                  <div className="product-meta-row" style={{ marginBottom: '24px' }}>
                    <span className="product-price-lux" style={{ fontSize: '1.4rem' }}>
                      ₹{recommendedProduct.price}
                    </span>
                    <span className="product-badge-lux product-badge-in">In Stock</span>
                  </div>

<div className="product-action-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     <button 
                       type="button"
                       className="product-btn-lux" 
                       onClick={handleAddToCart}
                       disabled={addedToCart}
                       style={{ padding: '14px', fontSize: '0.85rem' }}
                     >
                       {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
                     </button>

                     <div style={{ display: 'flex', gap: '8px' }}>
                       <button
                         type="button"
                         onClick={handleShareQuiz}
                         style={{
                           flex: 1,
                           padding: '10px',
                           fontSize: '0.8rem',
                           backgroundColor: '#38A169',
                           color: 'white',
                           border: 'none',
                           borderRadius: '4px',
                           cursor: 'pointer',
                         }}
                       >
                         📱 Share
                       </button>
                       <a 
                         href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'}?text=${encodeURIComponent(`Hi! The Pickle Finder Quiz recommended the ${recommendedProduct.name} (₹${recommendedProduct.price}). I'd like to place an order!`)}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="btn-whatsapp-order"
                         style={{ flex: 1, margin: 0 }}
                       >
                         💬 Order on WhatsApp
                       </a>
                     </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="no-items-text" style={{ padding: '40px', marginBottom: '40px' }}>
                We couldn't load the recommendation. Try running the quiz again!
              </div>
            )}

            {/* Restart Buttons */}
            <div style={{ textAlign: 'center' }}>
              <button 
                type="button"
                className="quiz-back-btn" 
                onClick={handleReset}
                style={{ textDecoration: 'underline' }}
              >
                🔄 Retake the Quiz
              </button>
              
              <div style={{ marginTop: '20px' }}>
                <Link href="/products" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', color: '#7B1C1C' }}>
                  Or browse all pickles &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
