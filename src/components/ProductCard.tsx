"use client";
import React, { useState } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import JarSizeSelector from './JarSizeSelector';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  stockStatus: string;
  spiciness?: number;
  sizes?: any;
  batchNumber?: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();

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
      quantity: 1,
      imageUrl: product.imageUrl || '',
      sizeLabel: selectedSize || undefined
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
        {product.batchNumber && (
          <div className="batch-badge-card">
            {product.batchNumber}
          </div>
        )}
        {product.name === "Aunty's Starter Trio" && (
          <div className="batch-badge-card" style={{ backgroundColor: 'var(--color-accent)', color: 'white', border: 'none', top: '12px', left: '12px' }}>
            Starter Pack
          </div>
        )}
      </div>


      <div className="product-overlay">
        <h3 className="product-title-lux">{product.name}</h3>
        <p className="product-desc-lux">{product.description}</p>
        
        <div className="product-meta-row">
          <span className="product-price-lux">₹{selectedPrice}</span>
          <span className={`product-badge-lux ${product.stockStatus === 'IN_STOCK' ? 'product-badge-in' : 'product-badge-out'}`}>
            {product.stockStatus === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {hasSizes && (
          <div 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} 
            style={{ position: 'relative', zIndex: 10 }}
          >
            <JarSizeSelector
              sizes={parsedSizes}
              selectedSize={selectedSize}
              onSizeSelect={(size) => {
                setSelectedSize(size.label);
                setSelectedPrice(size.price);
              }}
            />
          </div>
        )}
        
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


