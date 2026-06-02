"use client";
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [logoClicks, setLogoClicks] = useState(0);

  // Hidden keystroke redirect: Ctrl + Shift + A (or Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        router.push('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Click handler to redirect on 5 clicks on the "JAIPUR" subtitle logo
  const handleSubtitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = logoClicks + 1;
    if (newCount >= 5) {
      setLogoClicks(0);
      router.push('/admin/login');
    } else {
      setLogoClicks(newCount);
      // Auto reset clicks after 3 seconds of inactivity
      const timer = setTimeout(() => setLogoClicks(0), 3000);
      return () => clearTimeout(timer);
    }
  };

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
          
          <div className="navbar-logo">
            <Link href="/">
              <div className="logo-title">THE ACHAR PROJECT</div>
            </Link>
            <div 
              className="logo-subtitle" 
              onClick={handleSubtitleClick}
              style={{ userSelect: 'none', cursor: 'default' }}
            >
              JAIPUR
            </div>
          </div>
          
          <div className="navbar-right">
            {/* Admin link is now hidden! Accessible via Ctrl+Shift+A or clicking "JAIPUR" 5 times */}
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
            Delicacies (Lehsua)
          </Link>
        </div>
      </div>
    </header>
  );
}


