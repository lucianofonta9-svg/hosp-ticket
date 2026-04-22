// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Captura todo excepto api, _next/static, _next/image y archivos con extensión (png, svg, etc)
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};