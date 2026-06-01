import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export const revalidate = 0; // Dynamic for MVP

export default async function Home() {
  const products = await prisma.product.findMany({
    take: 4, // Show 4 featured products
  });

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-badge">ESTD. 2026 • JAIPUR</div>
          <h1 className="hero-title">
            Artisanal Pickles <br />
            <span>Sun-Dried & Hand-Matured</span>
          </h1>
          <p className="hero-subtitle">
            Generational recipes from Rajasthan, crafted in small batches using cold-pressed mustard oil and pure local spices.
          </p>
          <div className="hero-actions">
            <Link href="/products" className="btn-lux-primary">
              Explore The Catalog
            </Link>
            <a href="#our-story" className="btn-lux-secondary">
              Our Heritage
            </a>
          </div>
        </div>
      </section>

      {/* Hero Highlight Image */}
      <section className="hero-image-section">
        <div className="container">
          <div className="hero-image-banner" style={{ backgroundImage: 'url(/uploads/kayri-ka-khatta.jpg)' }}>
            <div className="hero-image-overlay">
              <span className="overlay-tag">OUR SIGNATURE</span>
              <h2>Kayri Ka Khatta</h2>
              <p>Sun-matured over 21 days in traditional ceramic jars (martabans).</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">SELECTED PRODUCTS</span>
            <h2 className="section-title">The Signature Collection</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="section-action">
            <Link href="/products" className="btn-lux-outline">
              View All Pickles
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section id="our-story" className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <span className="story-tag">OUR HERITAGE</span>
              <h2 className="story-title">Ghar Ka Swaad, Honored Across Generations</h2>
              <div className="story-text">
                <p>
                  Every jar of our pickle is a labor of love. We start by sourcing raw mangoes, tender lasude, and fresh green chilies from local farms in Jaipur.
                </p>
                <p>
                  Following the instructions passed down by our grandmothers, we sun-dry our ingredients, blend them with freshly ground spices, and submerge them in pure mustard oil. We let them sit under the warm Rajasthani sun to mature naturally.
                </p>
                <p>
                  No chemicals, no artificial colors, no shortcuts. Just raw, pure flavor that takes you straight back to childhood summer vacations.
                </p>
              </div>
            </div>
            <div className="story-image" style={{ backgroundImage: 'url(/uploads/teekha-hari-mirch.jpg)' }}>
              <div className="story-image-label">Jaipur, Rajasthan</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

