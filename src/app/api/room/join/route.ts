import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';

export async function POST(req: NextRequest) {
  try {
    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ code: null });
    }

    const formData = await req.formData();
    const code = formData.get('code')?.toString().trim() || '';
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);
    const codeLength = Number(process.env.ROOM_CODE_LENGTH);

    if (code.length < codeLength) {
      return NextResponse.json({ code: null });
    }

    const existingData = await redis.get(code);
    if (!existingData) {
      return NextResponse.json({ code: null });
    }

    const data = {
      ...existingData,
      [userToken.email as string]: userToken.name as string,
    };
    await redis.set(code, data, {
      ex: ttl,
    });

    return NextResponse.json({ code });
  } catch (err) {
    console.log('🚀 ~ POST ~ err:', err);
    throw NextResponse.error();
  }
}
