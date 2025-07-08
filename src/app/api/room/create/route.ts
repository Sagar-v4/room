import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';
import { generate } from '@/lib/room-code';
import { CODE_FIELD_NAME } from '@/static/const';

export async function GET(req: NextRequest) {
  try {
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);

    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    const code = generate();
    const data: Room = {
      participants: {},
    };
    await redis.set(code, data, {
      ex: ttl,
    });

    return NextResponse.json({ [CODE_FIELD_NAME]: code });
  } catch (err) {
    console.log('💥 ~ create ~ err:', err);
    throw NextResponse.error();
  }
}
