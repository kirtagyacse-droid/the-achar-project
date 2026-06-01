"use client";
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  return (
    <header className="navbar-header">
      {/* Top Announcement Bar */}
      <div className="navbar-top-banner">
        <span>ESTD. 2026 • ARTISANAL HOMEMADE ACHAR FROM JAIPUR • FREE SHIPPING ON ALL ORDERS</span>
      </div>

      <div className="container">
        <nav className="navbar-main">
          <div className="navbar-left">
            <Link href="/products" className="nav-link-item">Shop</Link>
            <Link href="/#our-story" className="nav-link-item">Our Story</Link>
          </div>
          
          <Link href="/" className="navbar-logo">
            <div className="logo-title">THE ACHAR PROJECT</div>
            <div className="logo-subtitle">JAIPUR</div>
          </Link>
          
          <div className="navbar-right">
            <Link href="/admin/login" className="nav-link-item admin-link">Admin</Link>
            <Link href="/cart" className="nav-cart-btn">
              <span className="cart-text">Cart</span>
              {totalItems > 0 && <span className="cart-count-badge">{totalItems}</span>}
            </Link>
          </div>
        </nav>

        {/* Secondary Category Navigation */}
        <div className="navbar-categories">
          <Link href="/products" className={`category-item ${pathname === '/products' ? 'active' : ''}`}>
            All Pickles
          </Link>
          <Link href="/products?category=mango" className="category-item">
            Mango (Kayri)
          </Link>
          <Link href="/products?category=chili" className="category-item">
            Green Chili
          </Link>
          <Link href="/products?category=lemon" className="category-item">
            Lemon (Nimbu)
          </Link>
          <Link href="/products?category=delicacies" className="category-item">
            Delicacies (Lasuwa)
          </Link>
        </div>
      </div>
    </header>
  );
}

