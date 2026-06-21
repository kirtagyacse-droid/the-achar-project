import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from './prisma';

export async function applyRateLimit(
  routeKey: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const now = new Date();
    const expireAt = new Date(now.getTime() + windowMs);
    const key = `rl:${routeKey}:${ip}`;

    const record = await prisma.rateLimit.findUnique({
      where: { key }
    });

    if (!record) {
      await prisma.rateLimit.create({
        data: { key, points: 1, expireAt }
      }).catch(async () => {
        await prisma.rateLimit.update({
          where: { key },
          data: { points: { increment: 1 } }
        });
      });
      return null;
    }

    if (record.expireAt < now) {
      await prisma.rateLimit.update({
        where: { key },
        data: { points: 1, expireAt }
      });
      return null;
    }

    if (record.points >= limit) {
      const secondsToReset = Math.ceil((record.expireAt.getTime() - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': secondsToReset.toString() }
        }
      );
    }

    await prisma.rateLimit.update({
      where: { key },
      data: { points: { increment: 1 } }
    });
  } catch (error) {
    console.error('Rate limit error:', error);
  }

  return null;
}