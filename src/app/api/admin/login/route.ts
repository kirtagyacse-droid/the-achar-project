import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { applyRateLimit } from '@/lib/rateLimit';

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required')
});

export async function POST(req: Request) {
  // 1. Rate limiting: 5 attempts per 15 minutes
  const limitRes = await applyRateLimit('admin-login', 5, 15 * 60 * 1000);
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

    const { password } = result.data;
    const hash = process.env.ADMIN_PASSWORD_HASH;

    if (!hash) {
      console.error('ADMIN_PASSWORD_HASH environment variable is not configured.');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const isMatch = bcryptjs.compareSync(password, hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // 2. Generate stateless JWT tokens
    const payload = { role: 'admin' };
    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    // 3. Set HttpOnly SameSite=Strict cookies (for Website clients)
    const response = NextResponse.json({
      success: true,
      accessToken,
      refreshToken
    });

    const isProd = process.env.NODE_ENV === 'production';

    response.cookies.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 // 15 mins
    });

    response.cookies.set('admin_refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process login request' },
      { status: 500 }
    );
  }
}
