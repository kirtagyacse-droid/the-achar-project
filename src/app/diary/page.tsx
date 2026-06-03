import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const revalidate = 0;

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aunty\'s Diary | The Achar Project',
  description: 'Read stories, seasonal notes, and pickling milestones directly from Aunty in Jaipur. Homemade Rajasthani Achar, made with love in Jaipur.',
  openGraph: {
    title: 'Aunty\'s Diary | The Achar Project',
    description: 'Read stories, seasonal notes, and pickling milestones directly from Aunty in Jaipur. Homemade Rajasthani Achar, made with love in Jaipur.',
    images: [{ url: '/uploads/keri-ka-khatta.jpg' }],
  },
};

async function seedBlogPostsIfEmpty() {
  const count = await prisma.blogPost.count();
  if (count === 0) {
    console.log("Seeding initial blog posts...");
    await prisma.blogPost.createMany({
      data: [
        {
          title: "The Secret of the 21-Day Sun Soak",
          slug: "secret-of-21-day-sun-soak",
          content: `Namaste! Today I want to share why we let our mango pickles soak under the warm Jaipur sun for exactly 21 days. 

In the modern world, everything is rushed. Vinegar is added to speed up acidity, and heat is used to cook the mangoes quickly. But true Rajasthani Achar cannot be rushed. 

When we place our martabans (ceramic jars) on the terrace, the sun's gentle heat does something magical. It slowly draws out the excess moisture from the mango slices, preventing spoilage naturally without chemical preservatives. At the same time, the mustard oil heats up slightly during the day and cools down at night, allowing the mangoes to slowly absorb the ground spices. 

It is this slow expansion and contraction, repeated over 21 sun-soaked days, that gives our Keri ka Khatta its deep, mature tang and signature bite. If you open a jar from a batch that was sun-matured for only 10 days, the mangoes will feel rubbery and the spices will taste raw. 

So next time you open one of our jars, remember: you are tasting 21 days of warm Rajasthan sunshine. 💛`,
          coverImage: "/uploads/keri-ka-khatta.jpg",
          isPublished: true,
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          title: "Sourcing spices from the old bazaars of Jaipur",
          slug: "sourcing-spices-old-bazaars",
          content: `Every Tuesday morning, before the Rajasthan heat builds up, I take a walk through the narrow lanes of Johari Bazaar in the Pink City. 

The air there smells of history—a rich, heavy blend of cardamom, fennel, and cold-pressed mustard oil. I do not buy pre-packaged spices. To get the perfect texture in our pickles, the spices must be bought whole and ground by hand in our kitchen.

We look for heavy, deep green fennel seeds (saunf) which bring a cooling sweetness. The fenugreek (methi) must be golden-yellow and dry. And the mustard seeds (rai) must be small and sharp. 

Grinding them coarsely is the key. If you grind them into a fine powder, they release their oils too quickly and turn the pickle bitter. We want the spices to release their flavors slowly inside the jar over months, keeping the pickle fresh and fragrant. 

It takes extra effort, but when you eat our pickle with a warm paratha, that coarse texture of spices is what makes it feel like home.`,
          coverImage: "/uploads/teekha-hari-mirch.jpg",
          isPublished: true,
          publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
      ]
    });
  }
}

export default async function DiaryPage() {
  await seedBlogPostsIfEmpty();

  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '850px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span style={{ fontSize: '0.9rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 600 }}>
          PUBLIC BLOG
        </span>
        <h1 className="font-handwriting" style={{ fontSize: '4.5rem', margin: '10px 0 15px', color: 'var(--text-main)', lineHeight: 1.1 }}>
          Aunty's Diary
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
          Warm stories, traditional recipe secrets, and tales from our sun-soaked Jaipur kitchen.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {posts.map((post) => {
          // Generate a simple 2-line excerpt (about 150 chars)
          const cleanText = post.content.replace(/\n+/g, ' ');
          const excerpt = cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;
          
          return (
            <article 
              key={post.id}
              className="card"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                padding: '24px',
                border: '1px solid var(--border-light)',
                transition: 'transform 0.2s',
                alignItems: 'center'
              }}
            >
              {post.coverImage && (
                <div style={{
                  flex: '1 1 250px',
                  height: '200px',
                  backgroundImage: `url(${post.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '2px',
                  border: '1px solid var(--border-light)'
                }} />
              )}
              
              <div style={{ flex: '2 1 350px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                </span>
                
                <h2 className="font-handwriting" style={{ fontSize: '2.5rem', margin: '8px 0 12px', color: 'var(--text-main)', lineHeight: '1.2' }}>
                  {post.title}
                </h2>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '16px', lineHeight: '1.6' }}>
                  {excerpt}
                </p>
                
                <Link 
                  href={`/diary/${post.slug}`} 
                  style={{ 
                    color: 'var(--color-accent)', 
                    fontWeight: 600, 
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Read more &rarr;
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
