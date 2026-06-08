import { jwtVerify, SignJWT } from 'jose';

// Get secret key encoded as a Uint8Array
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return new TextEncoder().encode(secret);
};

export interface AdminJwtPayload {
  role: string;
}

/**
 * Signs a short-lived access token for admin (15 minutes expiry)
 */
export async function signAccessToken(payload: AdminJwtPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);
}

/**
 * Signs a long-lived refresh token for admin (7 days expiry)
 */
export async function signRefreshToken(payload: AdminJwtPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verifies a JWT token (access or refresh) and returns its payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminJwtPayload;
  } catch (error) {
    // Return null on signature verification failure or expiration
    return null;
  }
}
