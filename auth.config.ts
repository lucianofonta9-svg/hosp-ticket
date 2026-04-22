// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      // Si no está logueado y no está en la página de login, lo mandamos al login
      if (!isLoggedIn && !isOnLogin) {
        return false; 
      }

      // Si está logueado e intenta ir al login, lo mandamos a la principal
      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/', nextUrl));
      }

      return true;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;