import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: String(process.env.AUTH_SECRET),
  session: {
    strategy: 'jwt',
  },
  providers: [Google, GitHub],
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const homePageURL = '/';
      const isLoggedIn = !!auth?.user;
      const isOnHomePage = nextUrl.pathname === homePageURL;

      if (isLoggedIn || isOnHomePage) {
        return true;
      } else {
        return Response.redirect(new URL(homePageURL, nextUrl));
      }
    },
  },
});
