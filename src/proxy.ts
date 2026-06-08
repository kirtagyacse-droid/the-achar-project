import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, signAccessToken } from './lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Guard API admin routes (except login, refresh, logout)
  if (
    pathname.startsWith('/api/admin') &&
    pathname !== '/api/admin/login' &&
    pathname !== '/api/admin/refresh' &&
    pathname !== '/api/admin/logout'
  ) {
    let accessToken = request.cookies.get('admin_access_token')?.value;
    
    // Support Bearer Token in Authorization header (for Android App)
    if (!accessToken) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
      }
    }

    const payload = accessToken ? await verifyToken(accessToken) : null;
    
    if (!payload) {
      // Access token is missing or expired, attempt to refresh using the refresh token cookie
      const refreshToken = request.cookies.get('admin_refresh_token')?.value;
      if (refreshToken) {
        const refreshPayload = await verifyToken(refreshToken);
        if (refreshPayload && refreshPayload.role === 'admin') {
          // Refresh token is valid! Re-issue a new access token
          const newAccessToken = await signAccessToken({ role: 'admin' });
          const response = NextResponse.next();
          response.cookies.set('admin_access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60 // 15 minutes
          });
          return response;
        }
      }
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (payload.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  // 2. Guard Admin Dashboard page routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const accessToken = request.cookies.get('admin_access_token')?.value;
    let valid = false;

    if (accessToken) {
      const payload = await verifyToken(accessToken);
      if (payload && payload.role === 'admin') {
        valid = true;
      }
    }

    if (!valid) {
      // Access token is missing or expired, attempt to refresh using the refresh token cookie
      const refreshToken = request.cookies.get('admin_refresh_token')?.value;
      if (refreshToken) {
        const refreshPayload = await verifyToken(refreshToken);
        if (refreshPayload && refreshPayload.role === 'admin') {
          // Refresh token is valid! Re-issue a new access token
          const newAccessToken = await signAccessToken({ role: 'admin' });
          const response = NextResponse.next();
          response.cookies.set('admin_access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 15 * 60 // 15 minutes
          });
          return response;
        }
      }

      // If refresh token is also invalid or missing, redirect to login page
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};
