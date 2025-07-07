'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { room } from '@/api/routes';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const [isRoomFinding, setIsRoomFinding] = React.useState(true);
  const [isRoomJoining, setIsRoomJoining] = React.useState(false);

  const { code } = params;
  const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

  const joinRoom = React.useCallback(async () => {
    try {
      setIsRoomFinding(true);

      const formData = new FormData();
      formData.append(codeFieldName, code as string);

      const res = await fetch(room.join.url, {
        method: room.join.method,
        body: formData,
      });

      const data = await res.json();
      if (!data[codeFieldName]) {
        router.push('/');
      }
    } catch (err) {
      toast.error((err as Error).message);
      router.push('/');
    } finally {
      setIsRoomFinding(false);
      setIsRoomJoining(true); // TODO: later remove
    }
  }, [code, codeFieldName, router]);

  React.useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  return (
    <div>
      {isRoomFinding || isRoomJoining ? (
        <>
          <div className="absolute w-full z-50 h-screen flex justify-center items-center bg-black/50 flex-col gap-y-4 text-white ">
            <LoaderCircle className="scale-140 animate-spin" />
            {isRoomFinding ? (
              <span className="scale-200">Finding room...</span>
            ) : isRoomJoining ? (
              <span className="scale-200">Joining room...</span>
            ) : null}
          </div>
        </>
      ) : null}
      <>
        <p className="text-white bg-destructive">{code}</p>
      </>
    </div>
  );
}
