import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';

export async function POST(req: NextRequest) {
  try {
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);
    const codeLength = Number(process.env.ROOM_CODE_LENGTH);
    const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    const formData = await req.formData();
    const code = formData.get(codeFieldName)?.toString().trim();

    if (!code || code.length < codeLength) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    const existingData = await redis.get(code);
    if (!existingData) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    const data = {
      ...existingData,
      [userToken.email as string]: userToken.name as string,
    };
    await redis.set(code, data, {
      ex: ttl,
    });

    return NextResponse.json({ [codeFieldName]: code });
  } catch (err) {
    console.log('🚀 ~ POST ~ err:', err);
    throw NextResponse.error();
  }
}
