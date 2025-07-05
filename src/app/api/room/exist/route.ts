import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { isValidUrl } from '@/lib/is-valid-url';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';

export async function POST(req: NextRequest) {
  try {
    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ code: null });
    }

    const formData = await req.formData();
    let code = formData.get('code')?.toString().trim() || '';
    const codeLength = Number(process.env.ROOM_CODE_LENGTH);

    if (isValidUrl(code)) {
      const lastSlashIndex = code.lastIndexOf('/');
      code = code.substring(lastSlashIndex + 1).trim();
    }

    if (code.length < codeLength) {
      return NextResponse.json({ code: null });
    }

    const roomExist = await redis.get(code);
    if (!roomExist) {
      return NextResponse.json({ code: null });
    }

    return NextResponse.json({ code });
  } catch (err) {
    console.log('🚀 ~ POST ~ err:', err);
    throw NextResponse.error();
  }
}
