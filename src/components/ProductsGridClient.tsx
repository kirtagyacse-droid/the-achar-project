"use client";
import React, { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

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

export default function ProductsGridClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    // Check if user is a new visitor (has not placed an order)
    const hasOrderHistory = localStorage.getItem('achar_order_history_placed') === 'true';
    
    if (!hasOrderHistory) {
      // Pin "Aunty's Starter Trio" at the beginning of the list (position 0)
      const trioIndex = initialProducts.findIndex(p => p.name === "Aunty's Starter Trio");
      if (trioIndex !== -1) {
        const sortedProducts = [...initialProducts];
        const [trio] = sortedProducts.splice(trioIndex, 1);
        setProducts([trio, ...sortedProducts]);
      }
    } else {
      // If not a new visitor, show products as they are or with normal sorting
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  return (
    <div className="products-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
