import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { title, content, coverImage, isPublished } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ success: false, error: 'Title and content are required' }, { status: 400 });
    }

    // Auto-generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        content,
        coverImage: coverImage || null,
        isPublished: isPublished || false,
        slug,
        publishedAt: isPublished ? new Date() : null
      }
    });

    return NextResponse.json({ success: true, blogPost });
  } catch (error) {
    console.error('Error creating blog post:', error);
    const msg = error instanceof Error ? error.message : 'Failed to create blog post';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
