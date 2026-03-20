import type { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'access_token';

export function buildAuthCookieOptions(maxAge?: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
  };
}
