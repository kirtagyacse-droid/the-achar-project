import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from './prisma';

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Checks the rate limit in the database.
 * Vercel-compatible and serverless-safe.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = new Date();
  const expireAt = new Date(now.getTime() + windowMs);

  try {
    const record = await prisma.rateLimit.findUnique({
      where: { key }
    });

    if (!record) {
      try {
        await prisma.rateLimit.create({
          data: {
            key,
            points: 1,
            expireAt
          }
        });
      } catch (e) {
        // Handle race conditions where another thread created it
        await prisma.rateLimit.update({
          where: { key },
          data: {
            points: { increment: 1 }
          }
        });
      }
      return { success: true, limit, remaining: limit - 1, reset: expireAt };
    }

    if (record.expireAt < now) {
      // Record expired, reset window
      await prisma.rateLimit.update({
        where: { key },
        data: {
          points: 1,
          expireAt
        }
      });
      return { success: true, limit, remaining: limit - 1, reset: expireAt };
    }

    if (record.points >= limit) {
      return { success: false, limit, remaining: 0, reset: record.expireAt };
    }

    // Increment points
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        points: { increment: 1 }
      }
    });

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - updated.points),
      reset: record.expireAt
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open to avoid blocking legitimate users if DB is under heavy load
    return { success: true, limit, remaining: 1, reset: expireAt };
  }
}

/**
 * Helper to apply rate limit directly within a Next.js route handler.
 * Returns a NextResponse (429 Too Many Requests) if limited, or null if allowed.
 */
export async function applyRateLimit(
  routeKey: string,
  limit: number,
  windowMs: number
): Promise<NextResponse | null> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    
    const key = `rl:${routeKey}:${ip}`;
    const result = await checkRateLimit(key, limit, windowMs);

    if (!result.success) {
      const secondsToReset = Math.ceil((result.reset.getTime() - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': secondsToReset.toString(),
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toISOString()
          }
        }
      );
    }
  } catch (error) {
    console.error('Error applying rate limit:', error);
  }

  return null;
}
