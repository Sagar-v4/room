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

    let code = req.nextUrl.searchParams.get(CODE_FIELD_NAME)?.trim();
    if (!code || !verify(code)) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    if (isValidUrl(code)) {
      const lastSlashIndex = code.lastIndexOf('/');
      code = code.substring(lastSlashIndex + 1).trim();
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
