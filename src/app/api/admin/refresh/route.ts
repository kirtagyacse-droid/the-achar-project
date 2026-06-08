import { NextResponse } from 'next/server';
import { verifyToken, signAccessToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    let refreshToken: string | undefined;

    // 1. Try reading refresh token from cookies first (for web clients)
    const cookieToken = req.headers.get('cookie');
    if (cookieToken) {
      // Direct cookie reading might not be fully parsed in request object, let's parse it manually or get it
      const match = cookieToken.match(/admin_refresh_token=([^;]+)/);
      if (match) {
        refreshToken = match[1];
      }
    }

    // 2. Fallback to reading from JSON body (for Android App clients)
    if (!refreshToken) {
      try {
        const body = await req.json();
        refreshToken = body.refreshToken;
      } catch {
        // Body was empty or invalid JSON
      }
    }

    // 3. Fallback to Authorization header
    if (!refreshToken) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        refreshToken = authHeader.substring(7);
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token is required' },
        { status: 401 }
      );
    }

    // 4. Verify refresh token
    const payload = await verifyToken(refreshToken);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // 5. Generate a new access token
    const newAccessToken = await signAccessToken({ role: 'admin' });
    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken // Keep same refresh token
    });

    const isProd = process.env.NODE_ENV === 'production';
    
    // Update the access token cookie
    response.cookies.set('admin_access_token', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60 // 15 mins
    });

    return response;
  } catch (error) {
    console.error('Refresh API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process refresh request' },
      { status: 500 }
    );
  }
}
