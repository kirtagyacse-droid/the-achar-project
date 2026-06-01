"use client";
import React, { useState } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stockStatus: string;
  category: string;
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      imageUrl: product.imageUrl || '',
    };
    addToCart(item);
    alert(`${quantity}x ${product.name} added to cart!`);
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
            <h1 className="product-detail-title">{product.name}</h1>
            <div className="product-detail-price">₹{product.price}</div>
            
            <div className="product-detail-status">
              Status: <span className={product.stockStatus === 'IN_STOCK' ? 'status-in' : 'status-out'}>
                {product.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <div className="product-detail-divider"></div>
            
            <p className="product-detail-desc">{product.description}</p>
            
            <div className="product-detail-meta">
              <div className="meta-item">
                <strong>Ingredients:</strong> Local handpicked ingredients, cold-pressed mustard oil, fenugreek, fennel, mustard seeds, turmeric, salt, asafoetida.
              </div>
              <div className="meta-item">
                <strong>Care:</strong> Store in a dry place. Keep jar tightly sealed and submerged in oil.
              </div>
            </div>
            
            {product.stockStatus === 'IN_STOCK' ? (
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
            ) : (
              <div className="out-of-stock-msg">
                This item is currently out of stock. Check back later!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
