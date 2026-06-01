"use client";
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  
  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Your Cart is Empty</h1>
        <p style={{ marginBottom: '30px' }}>Looks like you haven't added any achar to your cart yet.</p>
        <Link href="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <h1 className="heading-serif" style={{ fontSize: '2.5rem', marginBottom: '40px' }}>Shopping Cart</h1>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        <div style={{ flex: '1 1 60%' }}>
          {cart.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', borderBottom: '1px solid #E0E0E0' }}>
              <div style={{ width: '100px', height: '100px', backgroundImage: `url(${item.imageUrl || '/placeholder.png'})`, backgroundSize: 'cover', borderRadius: '10px' }} />
              
              <div style={{ flex: 1 }}>
                <h3 className="heading-serif" style={{ fontSize: '1.2rem', marginBottom: '5px' }}>{item.name}</h3>
                <div style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>₹{item.price}</div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #CCC', backgroundColor: '#F9F9F9' }}
                >-</button>
                <span style={{ width: '30px', textAlign: 'center', fontWeight: '500' }}>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #CCC', backgroundColor: '#F9F9F9' }}
                >+</button>
              </div>
              
              <button 
                onClick={() => removeFromCart(item.id)}
                style={{ color: 'red', textDecoration: 'underline', padding: '10px' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        
        <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
          <div className="card" style={{ padding: '30px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
            <h2 className="heading-serif" style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '20px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-accent)' }}>₹{totalPrice}</span>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px', textAlign: 'center' }}>
              * Only Cash on Delivery (COD) is available currently.
            </p>
            
            <Link href="/checkout" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
