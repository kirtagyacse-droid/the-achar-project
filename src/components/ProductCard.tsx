"use client";
import React from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stockStatus: string;
  spiciness?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl || '',
    };
    addToCart(item);
  };

  return (
    <div className="product-card">
      <Link href={`/products/${product.id}`} className="product-link-overlay" aria-label={`View details of ${product.name}`} />
      
      <div className="product-image-container">
        <div 
          className="product-image" 
          style={{ backgroundImage: `url(${product.imageUrl || '/placeholder.png'})` }}
        />
        {product.spiciness !== undefined && product.spiciness > 0 && (
          <div className="product-spice-badge" title={`Spiciness: ${product.spiciness}/3`}>
            {Array(product.spiciness).fill('🌶️').join('')}
          </div>
        )}
      </div>

      <div className="product-overlay">
        <h3 className="product-title-lux">{product.name}</h3>
        <p className="product-desc-lux">{product.description}</p>
        
        <div className="product-meta-row">
          <span className="product-price-lux">₹{product.price}</span>
          <span className={`product-badge-lux ${product.stockStatus === 'IN_STOCK' ? 'product-badge-in' : 'product-badge-out'}`}>
            {product.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        <div className="product-action-wrap">
          <button 
            className="product-btn-lux" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stockStatus !== 'IN_STOCK'}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

