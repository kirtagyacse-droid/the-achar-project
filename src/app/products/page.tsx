import prisma from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryFilter = resolvedSearchParams.category as string | undefined;

  let products = await prisma.product.findMany();

  if (categoryFilter) {
    const filter = categoryFilter.toLowerCase();
    products = products.filter(product => {
      const name = product.name.toLowerCase();
      if (filter === 'mango') {
        return name.includes('kayri') || name.includes('mango');
      } else if (filter === 'chili') {
        return name.includes('mirch') || name.includes('chili');
      } else if (filter === 'lemon') {
        return name.includes('nimbu') || name.includes('lemon');
      } else if (filter === 'delicacies') {
        return name.includes('lasuwa') || name.includes('gunda') || name.includes('lasode');
      }
      return true;
    });
  }

  // Get a readable title for the category
  const getCategoryTitle = () => {
    if (!categoryFilter) return 'Our Pickles Menu';
    switch (categoryFilter.toLowerCase()) {
      case 'mango': return 'Mango Pickles (Kayri)';
      case 'chili': return 'Green Chili Pickles';
      case 'lemon': return 'Lemon Pickles (Nimbu)';
      case 'delicacies': return 'Traditional Delicacies (Lasuwa)';
      default: return 'Our Pickles Menu';
    }
  };

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
        
        {products.length === 0 ? (
          <div className="no-products text-center">
            <h3>No pickles found in this collection.</h3>
            <Link href="/products" className="btn-lux-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
              View All Pickles
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

