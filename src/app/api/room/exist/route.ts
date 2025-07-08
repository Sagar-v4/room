import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { isValidUrl } from '@/lib/is-valid-url';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';
import { verify } from '@/lib/room-code';
import { CODE_FIELD_NAME } from '@/static/const';

export async function GET(req: NextRequest) {
  try {
    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    let code = req.nextUrl.searchParams.get(CODE_FIELD_NAME)?.trim() ?? '';

    const url = isValidUrl(code);
    if (url) {
      code = url.pathname.split('/').at(1) ?? '';
    }

    if (!code || !verify(code)) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    const roomExist = await redis.exists(code);
    if (roomExist === 0) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    return NextResponse.json({ [CODE_FIELD_NAME]: code });
  } catch (err) {
    console.log('💥 ~ exist ~ err:', err);
    throw NextResponse.error();
  }
}
