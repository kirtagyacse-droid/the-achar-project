import prisma from '@/lib/prisma';
import ProductsGridClient from '@/components/ProductsGridClient';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { ensureStarterTrio } from '@/lib/starterTrio';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// India season detection
function getCurrentSeason(): 'summer' | 'winter' | null {
  const month = new Date().getMonth() + 1; // 1–12
  if (month >= 3 && month <= 6) return 'summer';
  if (month >= 10 || month <= 2) return 'winter';
  return null; // monsoon — no seasonal section
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryFilter = resolvedSearchParams.category as string | undefined;

  await ensureStarterTrio();
  let allProducts = await prisma.product.findMany();

  // Separate products by type
  const season = getCurrentSeason();
  const regularProducts = allProducts.filter(p => !p.season);
  const seasonalProducts = season ? allProducts.filter(p => p.season === season) : [];
  const pantryProducts = allProducts.filter(p => p.season === 'pantry');

  // Category filter applies only to regular products
  let filteredRegular = regularProducts;
  if (categoryFilter) {
    const filter = categoryFilter.toLowerCase();
    if (filter === 'seasonal') {
      filteredRegular = [];
    } else if (filter === 'pantry') {
      filteredRegular = [];
    } else {
      filteredRegular = regularProducts.filter(product => {
        const name = product.name.toLowerCase();
        if (filter === 'mango') return name.includes('keri') || name.includes('mango');
        if (filter === 'chili') return name.includes('mirch') || name.includes('chili');
        if (filter === 'lemon') return name.includes('nimbu') || name.includes('lemon');
        if (filter === 'delicacies') return name.includes('lehsua') || name.includes('lasuwa') || name.includes('gunda') || name.includes('lasode');
        return true;
      });
    }
  }

  const getCategoryTitle = () => {
    if (!categoryFilter) return 'Our Pickles Menu';
    switch (categoryFilter.toLowerCase()) {
      case 'mango': return 'Mango Pickles (Keri)';
      case 'chili': return 'Green Chili Pickles';
      case 'lemon': return 'Lemon Pickles (Nimbu)';
      case 'delicacies': return 'Traditional Delicacies (Lehsua)';
      case 'seasonal': return season === 'summer' ? '🌞 Summer Specials' : '❄️ Winter Specials';
      case 'pantry': return '🌿 From Our Pantry';
      default: return 'Our Pickles Menu';
    }
  };

  const seasonLabel = season === 'summer' ? 'Summer Specials 🌞' : '❄️ Winter Specials';
  const seasonEmoji = season === 'summer' ? '🌞' : '❄️';
  const seasonColors = season === 'summer'
    ? { bg: '#FFF8E7', border: '#F5C842', accent: '#C8860A', badge: 'SUMMER HARVEST' }
    : { bg: '#EEF4FB', border: '#A8C8E8', accent: '#1A5FA3', badge: 'WINTER HARVEST' };

  return (
    <div className="products-page-container">
      <div className="container">
        <div className="products-page-header">
          <span className="products-page-tag">ARTISANAL COLLECTION</span>
          <h1 className="products-page-title">{getCategoryTitle()}</h1>
          <p className="products-page-subtitle">
            Explore our curated menu of handcrafted Rajasthani pickles. Sun-dried to perfection, preserved in cold-pressed mustard oil.
          </p>
          <div className="products-page-divider"></div>
        </div>

        {/* Seasonal Section — only shown in matching season */}
        {(!categoryFilter || categoryFilter === 'seasonal') && seasonalProducts.length > 0 && (
          <div className="seasonal-section" style={{
            background: seasonColors.bg,
            border: `1px solid ${seasonColors.border}`,
            borderRadius: '2px',
            padding: '32px 24px',
            marginBottom: '40px'
          }}>
            <div className="seasonal-header">
              <span className="seasonal-badge" style={{ background: seasonColors.accent }}>
                {seasonColors.badge}
              </span>
              <h2 className="heading-serif" style={{ fontSize: '1.8rem', margin: '12px 0 4px' }}>
                {seasonEmoji} {seasonLabel}
              </h2>
              <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '24px' }}>
                {season === 'summer'
                  ? 'Rare seasonal varieties available only during the summer harvest. Get them before they\'re gone.'
                  : 'Fresh winter harvest specials — crafted with the season\'s finest produce. Limited batches only.'}
              </p>
            </div>
            <div className="products-grid">
              {seasonalProducts.map(product => (
                <ProductCard key={product.id} product={JSON.parse(JSON.stringify(product))} />
              ))}
            </div>
          </div>
        )}

        {/* Pantry Section — always visible */}
        {(!categoryFilter || categoryFilter === 'pantry') && pantryProducts.length > 0 && (
          <div className="pantry-section" style={{
            background: '#F2F7F0',
            border: '1px solid #C8DFC4',
            borderRadius: '2px',
            padding: '32px 24px',
            marginBottom: '40px'
          }}>
            <div className="seasonal-header">
              <span className="seasonal-badge" style={{ background: '#2E7D32' }}>FROM OUR PANTRY</span>
              <h2 className="heading-serif" style={{ fontSize: '1.8rem', margin: '12px 0 4px' }}>
                🌿 From Our Pantry
              </h2>
              <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '24px' }}>
                Beyond pickles — pure stone-ground powders and artisanal spice blends from our Jaipur kitchen.
              </p>
            </div>
            <div className="products-grid">
              {pantryProducts.map(product => (
                <ProductCard key={product.id} product={JSON.parse(JSON.stringify(product))} />
              ))}
            </div>
          </div>
        )}

        {/* Regular pickles */}
        {(!categoryFilter || !['seasonal', 'pantry'].includes(categoryFilter)) && (
          filteredRegular.length === 0 ? (
            <div className="no-products text-center">
              <h3>No pickles found in this collection.</h3>
              <Link href="/products" className="btn-lux-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                View All Pickles
              </Link>
            </div>
          ) : (
            <ProductsGridClient initialProducts={JSON.parse(JSON.stringify(filteredRegular))} />
          )
        )}
      </div>
    </div>
  );
}
