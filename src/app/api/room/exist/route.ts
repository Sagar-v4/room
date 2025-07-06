import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { isValidUrl } from '@/lib/is-valid-url';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';

export async function POST(req: NextRequest) {
  try {
    const codeLength = Number(process.env.ROOM_CODE_LENGTH);
    const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    const formData = await req.formData();
    let code = formData.get(codeFieldName)?.toString().trim();

    if (!code || code.length < codeLength) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    if (isValidUrl(code)) {
      const lastSlashIndex = code.lastIndexOf('/');
      code = code.substring(lastSlashIndex + 1).trim();
    }

    const roomExist = await redis.get(code);
    if (!roomExist) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    return NextResponse.json({ [codeFieldName]: code });
  } catch (err) {
    console.log('🚀 ~ POST ~ err:', err);
    throw NextResponse.error();
  }
}
