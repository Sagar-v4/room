import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';
import { generate } from '@/lib/room-code';

export async function GET(req: NextRequest) {
  try {
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);
    const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    const code = generate();
    const data: Room = {
      participants: null,
      lastJoinedAt: 0,
      lastFetchedAt: 0,
    };
    await redis.set(code, data, {
      ex: ttl,
    });

    return NextResponse.json({ [codeFieldName]: code });
  } catch (err) {
    console.log('🚀 ~ create ~ err:', err);
    throw NextResponse.error();
  }
}
