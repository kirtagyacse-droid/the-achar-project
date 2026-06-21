import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET missing');
  return new TextEncoder().encode(secret);
};

async function verifyRiderToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as { riderId: string; role: string };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function proxy(req: NextRequest) {
  console.log('--- PROXY EXECUTING FOR:', req.nextUrl.pathname);
  const accessToken = req.cookies.get('rider_access_token')?.value;

  if (req.nextUrl.pathname === '/login' || req.nextUrl.pathname.startsWith('/api/auth/')) {
    if (req.nextUrl.pathname === '/login' && accessToken) {
      const payload = await verifyRiderToken(accessToken);
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
    return NextResponse.next();
  }

  const handleUnauthorized = () => {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  };

  if (!accessToken) {
    return handleUnauthorized();
  }

  const payload = await verifyRiderToken(accessToken);
  if (!payload) {
    return handleUnauthorized();
  }

  console.log('Middleware Token Valid, riderId:', payload.riderId);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-rider-id', payload.riderId);

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};