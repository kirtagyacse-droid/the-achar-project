import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import SunProcessGallery from '@/components/SunProcessGallery';
import ProvenanceMap from '@/components/ProvenanceMap';
import FirstTimerBanner from '@/components/FirstTimerBanner';
import { ensureStarterTrio } from '@/lib/starterTrio';

export const revalidate = 0; // Dynamic for MVP

export default async function Home() {
  await ensureStarterTrio();
  const starterTrio = await prisma.product.findFirst({
    where: { name: "Aunty's Starter Trio" }
  });

  const products = await prisma.product.findMany({
    take: 4, // Show 4 featured products
  });

  const latestPost = await prisma.blogPost.findFirst({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' }
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div className="hero-actions">
              <Link href="/products" className="btn-lux-primary">
                Explore The Catalog
              </Link>
              <Link href="/quiz" className="btn-lux-secondary">
                Find Your Perfect Pickle →
              </Link>
            </div>
            <div>
              <Link href="/subscribe" className="font-handwriting" style={{ fontSize: '2.2rem', color: 'var(--color-accent)', textDecoration: 'none' }}>
                Join the Achar Club &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* First Timer Sampler Pack Banner */}
      <FirstTimerBanner starterTrioId={starterTrio?.id} />

      {/* Hero Highlight Image */}
      <section className="hero-image-section">
        <div className="container">
          <div className="hero-image-banner" style={{ backgroundImage: 'url(/uploads/keri-ka-khatta.jpg)' }}>
            <div className="hero-image-overlay">
              <span className="overlay-tag">OUR SIGNATURE</span>
              <h2>Keri Ka Khatta</h2>
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

      {/* Sun-Process Gallery */}
      <SunProcessGallery />

      {/* Provenance Map */}
      <ProvenanceMap />

      {/* Latest from Aunty Section */}
      {latestPost && (
        <section className="latest-blog-section" style={{ padding: '80px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <div className="section-header text-center" style={{ marginBottom: '40px' }}>
              <span className="section-tag" style={{ color: 'var(--color-accent)', fontWeight: 600, letterSpacing: '0.1em' }}>AUNTY'S DIARY</span>
              <h2 className="section-title" style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginTop: '8px' }}>Latest from the Kitchen</h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-accent)', margin: '15px auto' }}></div>
            </div>
            
            <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '24px', border: '1px solid var(--border-light)', backgroundColor: 'white', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              {latestPost.coverImage && (
                <div style={{
                  flex: '1 1 250px',
                  height: '200px',
                  backgroundImage: `url(${latestPost.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '2px',
                  border: '1px solid var(--border-light)'
                }} />
              )}
              <div style={{ flex: '2 1 300px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {latestPost.publishedAt ? new Date(latestPost.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                </span>
                <h3 className="font-handwriting" style={{ fontSize: '2.4rem', margin: '8px 0 12px', color: 'var(--text-main)', lineHeight: '1.2' }}>
                  {latestPost.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.6' }}>
                  {latestPost.content.replace(/\n+/g, ' ').substring(0, 150)}...
                </p>
                <Link href={`/diary/${latestPost.slug}`} className="btn-lux-outline" style={{ display: 'inline-block', padding: '8px 16px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Read entry &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section id="our-story" className="story-section">
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <span className="story-tag">OUR HERITAGE</span>
              <h2 className="story-title">Ghar Ka Swaad, Honored Across Generations</h2>
              <div className="story-text">
                <p>
                  Every jar of our pickle is a labor of love. We start by sourcing raw mangoes, tender lehsua, and fresh green chilies from local farms in Jaipur.
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

