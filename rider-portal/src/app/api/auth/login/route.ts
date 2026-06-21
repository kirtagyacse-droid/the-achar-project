import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { signRiderAccessToken, signRiderRefreshToken } from '@/lib/riderAuth';
import { applyRateLimit } from '@/lib/rateLimit';
import prisma from '@/lib/prisma';

const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  pin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d{4}$/, 'PIN must be numeric')
});

export async function POST(req: Request) {
  const limitRes = await applyRateLimit('rider-login', 5, 15 * 60 * 1000);
  if (limitRes) return limitRes;

  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone, pin } = result.data;

    const rider = await prisma.rider.findUnique({
      where: { phone, isActive: true }
    });

    if (!rider) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone or PIN' },
        { status: 401 }
      );
    }

    const isMatch = bcryptjs.compareSync(pin, rider.pinHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone or PIN' },
        { status: 401 }
      );
    }

    const payload = { riderId: rider.id, role: 'rider' as const };
    const accessToken = await signRiderAccessToken(payload);
    const refreshToken = await signRiderRefreshToken(payload);

    const response = NextResponse.json({
      success: true,
      rider: { id: rider.id, name: rider.name, phone: rider.phone }
    });

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('rider_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 60 * 60
    });

    response.cookies.set('rider_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Rider login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}