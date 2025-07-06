import { NextRequest } from 'next/server';
import { decode, JWTDecodeParams } from 'next-auth/jwt';

export async function authjsDecodeJWT(req: NextRequest) {
  const secret = String(process.env.AUTH_JWT_SECRET);
  const cookieName = String(process.env.AUTH_COOKIE_NAME);
  const token = req.cookies.get(cookieName)?.value;

  const decoded = await decode({
    salt: cookieName,
    token: token,
    secret: secret,
  } as JWTDecodeParams);

  return decoded;
}
