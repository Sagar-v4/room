import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: String(process.env.AUTH_SECRET),
  session: {
    strategy: 'jwt',
  },
  providers: [Google, GitHub],
});
