import type { CookieSerializeOptions } from '@fastify/cookie';

export const COMMON_COOKIE_SETTINGS: CookieSerializeOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'strict',
};
