/**
 * JWT Authentication middleware for AURA API routes.
 * Issues an HttpOnly signed session cookie on login and verifies it on protected endpoints.
 * Closes the security gap where userId was trusted from the request body.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'aura_dev_secret_change_in_production';
const COOKIE_NAME = 'aura_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Issues a signed JWT session cookie. Call this after successful login/signup.
 */
export function issueSessionCookie(res: Response, userId: string): void {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
}

/**
 * Clears the session cookie. Call this on logout.
 */
export function clearSessionCookie(res: Response): void {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

/**
 * Middleware that verifies the session cookie and attaches userId to req.
 * Returns 401 if the cookie is missing or tampered with.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  // Support cookie header or Authorization bearer (for mobile/Capacitor clients)
  let token: string | undefined;

  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (match) {
    token = match[1];
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

/**
 * Optional auth — attaches userId if cookie present but doesn't block unauthenticated requests.
 * Useful for endpoints that work for both guests and logged-in users.
 */
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (match) {
    try {
      const decoded = jwt.verify(match[1], JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
    } catch { /* silently ignored */ }
  }
  next();
}
