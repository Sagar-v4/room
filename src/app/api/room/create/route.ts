import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { decodeAuthjsJWT } from '@/lib/authjs-jwt';
import { generate } from '@/lib/room-code';
import { CODE_FIELD_NAME } from '@/static/const';

export async function GET(req: NextRequest) {
  try {
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);

    const userToken = await decodeAuthjsJWT(req);
    if (!userToken) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    const code = generate();
    const data: Room = {
      participants: {},
      blocks: [],
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
