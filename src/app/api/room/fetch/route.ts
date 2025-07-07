import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';
import { verify } from '@/lib/room-code';

export async function POST(req: NextRequest) {
  try {
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);
    const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    const formData = await req.formData();
    const code = formData.get(codeFieldName)?.toString().trim();

    if (!code || !verify(code)) {
      return NextResponse.json({ [codeFieldName]: null });
    }

    const roomData: Room | null = await redis.get(code);
    if (!roomData) {
      return NextResponse.json({
        [codeFieldName]: null,
        participants: null,
      });
    }

    if (roomData.lastJoinedAt > roomData.lastFetchedAt) {
      const data: Room = {
        ...roomData,
        participants: null,
        lastFetchedAt: Date.now(),
      };
      await redis.set(code, data, {
        ex: ttl,
      });
    }

    return NextResponse.json({
      [codeFieldName]: code,
      participants: roomData.participants,
    });
  } catch (err) {
    console.log('🚀 ~ fetch ~ err:', err);
    throw NextResponse.error();
  }
}
