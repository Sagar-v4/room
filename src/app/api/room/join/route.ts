import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { decodeAuthjsJWT } from '@/lib/authjs-jwt';
import { verify } from '@/lib/room-code';
import {
  CODE_FIELD_NAME,
  PEER_ID_FIELD_NAME,
  UNIQUE_USER_ID_FIELD_NAME,
} from '@/static/const';

export async function POST(req: NextRequest) {
  try {
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);

    const userToken = await decodeAuthjsJWT(req);
    if (!userToken) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    const formData = await req.formData();
    const code = formData.get(CODE_FIELD_NAME)?.toString().trim();

    if (!code || !verify(code)) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    const roomData: Room | null = await redis.get(code);
    if (!roomData) {
      return NextResponse.json({ [CODE_FIELD_NAME]: null });
    }

    const peer_id = formData.get(PEER_ID_FIELD_NAME)?.toString().trim();

    const uuid = userToken[UNIQUE_USER_ID_FIELD_NAME] as UserProviderId;
    if (peer_id && uuid) {
      roomData.participants[uuid] = peer_id;
      await redis.set(code, roomData, {
        ex: ttl,
      });
    }

    return NextResponse.json({ [CODE_FIELD_NAME]: code, ...roomData });
  } catch (err) {
    console.log('💥 ~ join ~ err:', err);
    throw NextResponse.error();
  }
}
