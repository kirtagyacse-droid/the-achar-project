import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { FromKitchenBlock } from '@/components/FromKitchenBlock';
import { RelatedProductsGrid } from '@/components/RelatedProductsGrid';

export const revalidate = 0;

import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const post = await prisma.blogPost.findUnique({
    where: { slug }
  });

  if (!post) {
    return {
      title: 'Diary Entry | RS Savoury',
      description: 'Homemade Rajasthani pickles and delicacies, made with love in Jaipur.',
    };
  }

  const snippet = post.content.substring(0, 160).replace(/\n/g, ' ') + '...';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rssavoury.com';
  const ogImage = `${siteUrl}/api/og/diary?slug=${slug}`;

  return {
    title: `${post.title} | Aunty's Diary`,
    description: `${snippet} Homemade Rajasthani Achar, made with love in Jaipur.`,
    openGraph: {
      title: `${post.title} | Aunty's Diary`,
      description: `${snippet} Homemade Rajasthani Achar, made with love in Jaipur.`,
      images: [{ url: ogImage }],
    },
    other: {
      'twitter:card': 'summary_large_image',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const post = await prisma.blogPost.findUnique({
    where: { slug }
  });

  if (!post || !post.isPublished) {
    notFound();
  }

  // Fetch related products if productIds are set
  const relatedProducts = post.productIds && post.productIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: post.productIds } },
        select: { id: true, name: true, price: true, imageUrl: true, description: true }
      })
    : [];

  return (
    <article className="container" style={{ padding: '60px 24px', maxWidth: '700px' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/diary" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          &larr; Back to Aunty&apos;s Diary
        </Link>
      </div>

      {post.coverImage && (
        <div style={{
          width: '100%',
          height: '350px',
          backgroundImage: `url(${post.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '2px',
          border: '1px solid var(--border-light)',
          marginBottom: '30px'
        }} />
      )}

      <header style={{ marginBottom: '30px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Published on {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
        </span>
        
        {/* Seasonal Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {post.tags.map(tag => (
              <span key={tag} style={{
                display: 'inline-block',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '4px 10px',
                borderRadius: '4px',
                marginRight: '8px',
                backgroundColor: tag === 'festival' || tag === 'gift-guide' || tag === 'diwali' ? 'var(--color-accent-light)' : '#E2E8F0',
                color: tag === 'festival' || tag === 'gift-guide' || tag === 'diwali' ? 'var(--color-accent)' : '#4A5568'
              }}>
                {tag.replace('-', ' ')}
              </span>
            ))}
          </div>
        )}
        
        <h1 className="font-handwriting" style={{ fontSize: '4rem', color: 'var(--text-main)', marginTop: '8px', lineHeight: 1.1 }}>
          {post.title}
        </h1>
      </header>

      {/* From Kitchen Block */}
      {post.isFromKitchen && <FromKitchenBlock />}

      <div 
        style={{ 
          fontSize: '1.15rem', 
          lineHeight: '1.8', 
          color: 'var(--text-main)', 
          whiteSpace: 'pre-wrap' 
        }}
      >
        {post.content}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProductsGrid products={relatedProducts} />
      )}

      <div style={{ marginTop: '50px', padding: '30px 0', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
        <p className="font-handwriting" style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: '8px' }}>
          With love, from Jaipur
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          RS SAVOURY
        </p>
      </div>
    </article>
  );
}