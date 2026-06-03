import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || !token || token !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create blog post' }, { status: 500 });
  }
}
