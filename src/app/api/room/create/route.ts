import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/redis';
import { generateCode } from '@/lib/generate-code';
import { authjsDecodeJWT } from '@/lib/authjs-decode-jwt';

export async function GET(req: NextRequest) {
  try {
    const userToken = await authjsDecodeJWT(req);
    if (!userToken) {
      return NextResponse.json({ code: null });
    }

    let code: string;
    let times = Number(process.env.ROOM_CREATE_TRY);
    const ttl = Number(process.env.ROOM_TTL_IN_SEC);
    const codeLength = Number(process.env.ROOM_CODE_LENGTH);

    while (true) {
      code = generateCode(codeLength);

      const existingData = await redis.get(code);
      if (!existingData) {
        await redis.set(
          code,
          {},
          {
            ex: ttl,
          },
        );
        break;
      }

      times--;
      if (times <= 0) {
        return NextResponse.json({ code: null });
      }
    }

    return NextResponse.json({ code });
  } catch (err) {
    console.log('🚀 ~ GET ~ err:', err);
    throw NextResponse.error();
  }
}
