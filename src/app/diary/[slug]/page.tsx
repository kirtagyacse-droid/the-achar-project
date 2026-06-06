import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

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

  return {
    title: `${post.title} | Aunty's Diary`,
    description: `${snippet} Homemade Rajasthani Achar, made with love in Jaipur.`,
    openGraph: {
      title: `${post.title} | Aunty's Diary`,
      description: `${snippet} Homemade Rajasthani Achar, made with love in Jaipur.`,
      images: post.coverImage ? [{ url: post.coverImage }] : [{ url: '/uploads/keri-ka-khatta.jpg' }],
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

  return (
    <article className="container" style={{ padding: '60px 24px', maxWidth: '700px' }}>
      <div style={{ marginBottom: '30px' }}>
        <Link href="/diary" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          &larr; Back to Aunty's Diary
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
        <h1 className="font-handwriting" style={{ fontSize: '4rem', color: 'var(--text-main)', marginTop: '8px', lineHeight: 1.1 }}>
          {post.title}
        </h1>
      </header>

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
