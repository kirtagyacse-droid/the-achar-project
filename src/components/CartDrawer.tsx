"use client";
import React, { useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartDrawer() {
  const { cart, isCartOpen, setCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCartOpen(false);
      }
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Lock background scroll
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={() => setCartOpen(false)}>
      <div 
        className="cart-drawer-container" 
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <h2 className="heading-serif">Your Jars Selection</h2>
          <button className="btn-close-drawer" onClick={() => setCartOpen(false)} aria-label="Close Cart">
            &times;
          </button>
        </div>

        {/* Drawer Content */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="drawer-empty-state">
              <span className="empty-emoji">🌶️</span>
              <p>Your basket is empty.</p>
              <p className="empty-subtext">Add some artisanal Jaipur pickles to start your culinary journey.</p>
              <button 
                className="btn-lux-primary" 
                style={{ marginTop: '20px' }}
                onClick={() => {
                  setCartOpen(false);
                  router.push('/products');
                }}
              >
                Shop Our Menu
              </button>
            </div>
          ) : (
            <div className="drawer-items-list">
              {cart.map((item) => (
                <div key={item.id} className="drawer-item-card">
                  <div 
                    className="drawer-item-img" 
                    style={{ backgroundImage: `url(${item.imageUrl || '/placeholder.png'})` }}
                  />
                  <div className="drawer-item-details">
                    <h4 className="heading-serif">{item.name}</h4>
                    <span className="drawer-item-price">₹{item.price}</span>
                    
                    <div className="drawer-qty-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className="btn-remove-drawer-item" 
                    onClick={() => removeFromCart(item.id)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="drawer-summary-row">
              <span>Subtotal:</span>
              <strong className="subtotal-val">₹{totalPrice}</strong>
            </div>
            <p className="drawer-shipping-note">Free Pan-India Shipping & Cash on Delivery (COD) applied</p>
            <button 
              className="btn-checkout-drawer"
              onClick={() => {
                setCartOpen(false);
                router.push('/checkout');
              }}
            >
              Secure Checkout &rarr;
            </button>
            <button 
              className="btn-view-cart-page"
              onClick={() => {
                setCartOpen(false);
                router.push('/cart');
              }}
            >
              View Full Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
