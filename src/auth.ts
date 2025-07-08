import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { verify } from '@/lib/room-code';
import { CODE_FIELD_NAME } from '@/static/const';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: String(process.env.AUTH_JWT_SECRET),
  jwt: {
    maxAge: Number(process.env.AUTH_JWT_TOKEN_EXPIRE_IN_SEC),
  },
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.AUTH_COOKIE_EXPIRE_IN_SEC),
  },
  cookies: {
    sessionToken: {
      name: String(process.env.AUTH_COOKIE_NAME),
    },
  },
  providers: [Google, GitHub],
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const homePageURL = '/';
      const isLoggedIn = !!auth?.user;
      const isOnHomePage = nextUrl.pathname === homePageURL;

      if (isLoggedIn || isOnHomePage) {
        return true;
      }

      const code = nextUrl.pathname.split('/').at(1);
      const redirectURL = new URL(homePageURL, nextUrl);

      if (code && verify(code)) {
        redirectURL.searchParams.append(CODE_FIELD_NAME, code);
        return Response.redirect(redirectURL);
      }

      return Response.redirect(redirectURL);
    },
  },
});
