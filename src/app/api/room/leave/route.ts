import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';
import { verify } from '@/lib/room-code';
import { CODE_FIELD_NAME, UNIQUE_USER_ID_FIELD_NAME } from '@/static/const';

export async function POST(req: NextRequest) {
  try {
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);

    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({});
    }

    const formData = await req.formData();
    const code = formData.get(CODE_FIELD_NAME)?.toString().trim();

    if (!code || !verify(code)) {
      return NextResponse.json({});
    }

    const roomData: Room | null = await redis.get(code);
    const uuid = userToken[UNIQUE_USER_ID_FIELD_NAME] as string;

    if (roomData && uuid) {
      delete roomData.participants[uuid];
      await redis.set(code, roomData, {
        ex: ttl,
      });
    }

    return NextResponse.json({});
  } catch (err) {
    console.log('💥 ~ leave ~ err:', err);
    throw NextResponse.error();
  }
}
