import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the cookies by setting maxAge to 0
  const isProd = process.env.NODE_ENV === 'production';
  
  response.cookies.set('admin_access_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });

  response.cookies.set('admin_refresh_token', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });

  return response;
}
