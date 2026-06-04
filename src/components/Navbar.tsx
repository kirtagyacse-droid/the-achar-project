"use client";
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useGiftingMode } from '@/context/GiftingModeContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { totalItems, setCartOpen } = useCart();
  const { isGiftingMode, toggleGiftingMode } = useGiftingMode();
  const pathname = usePathname();
  const router = useRouter();
  const [logoClicks, setLogoClicks] = useState(0);
  const [shouldAnimateBadge, setShouldAnimateBadge] = useState(false);

  // Animate the cart badge when items count changes
  useEffect(() => {
    if (totalItems > 0) {
      setShouldAnimateBadge(true);
      const timer = setTimeout(() => setShouldAnimateBadge(false), 500);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

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

      {/* Gifting Mode Banner */}
      {isGiftingMode && (
        <div className="gifting-mode-banner">
          🎁 You're in Gifting Mode — explore curated gift sets, choose special packaging, or <Link href="/gift-builder" style={{ textDecoration: 'underline', fontWeight: 'bold' }}>build your own custom Gift Box</Link>!
        </div>
      )}

      <div className="container">
        <nav className="navbar-main">
          <div className="navbar-left">
            <Link href="/products" className="nav-link-item">Shop</Link>
            <Link href="/#our-story" className="nav-link-item">Our Story</Link>
            <Link href="/gift-builder" className="nav-link-item" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>🎁 Build a Gift Box</Link>
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
          
          <div className="navbar-right" style={{ gap: '16px' }}>
            {/* Gifting Mode Toggle Button */}
            <button 
              type="button"
              className={`nav-gifting-btn ${isGiftingMode ? 'active' : ''}`}
              onClick={toggleGiftingMode}
            >
              🎁 Gifting Mode
            </button>

            {/* Cart Link */}
            <Link 
              href="/cart" 
              className="nav-cart-btn"
              onClick={(e) => {
                e.preventDefault();
                setCartOpen(true);
              }}
            >
              <span className="cart-text">Cart</span>
              {totalItems > 0 && (
                <span className={`cart-count-badge ${shouldAnimateBadge ? 'badge-bounce' : ''}`}>
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </nav>

        {/* Secondary Category Navigation */}
        <div className="navbar-categories">
          <Link href="/products" className={`category-item ${pathname === '/products' ? 'active' : ''}`}>
            All Pickles
          </Link>
          <Link href="/products?category=mango" className="category-item">
            Mango (Keri)
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
          <Link href="/products?category=seasonal" className="category-item category-item--seasonal">
            🌸 Season's Special
          </Link>
          <Link href="/products?category=pantry" className="category-item category-item--pantry">
            🌿 From Our Pantry
          </Link>
          <Link href="/diary" className={`category-item ${pathname === '/diary' ? 'active' : ''}`} style={{ borderLeft: '1px solid var(--border-medium)', paddingLeft: '16px', marginLeft: '8px' }}>
            Aunty's Diary
          </Link>
        </div>
      </div>
    </header>
  );
}



