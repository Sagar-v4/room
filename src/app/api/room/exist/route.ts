import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { isValidUrl } from '@/lib/is-valid-url';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';
import { verify } from '@/lib/room-code';

export async function POST(req: NextRequest) {
  try {
    const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    const formData = await req.formData();
    let code = formData.get(codeFieldName)?.toString().trim();

    if (!code || !verify(code)) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    if (isValidUrl(code)) {
      const lastSlashIndex = code.lastIndexOf('/');
      code = code.substring(lastSlashIndex + 1).trim();
    }

    const roomExist = await redis.exists(code);
    if (roomExist === 0) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    return NextResponse.json({ [codeFieldName]: code });
  } catch (err) {
    console.log('🚀 ~ exist ~ err:', err);
    throw NextResponse.error();
  }
}
