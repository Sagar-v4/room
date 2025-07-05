import { NextRequest } from 'next/server';
import { decode, JWTDecodeParams } from 'next-auth/jwt';

export async function authjsDecodeJWT(req: NextRequest) {
  const cookieName = 'authjs.session-token';
  const jwtSecrate = String(process.env.AUTH_SECRET);
  const sessionToken = req.cookies.get(cookieName)?.value;

  const decoded = await decode({
    salt: cookieName,
    token: sessionToken,
    secret: jwtSecrate,
  } as JWTDecodeParams);

  return decoded;
}
