'use client';

import * as React from 'react';
import { LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { room } from '@/api/routes';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingMessage, setLoadingMessage] = React.useState('Welcome!');

  const { code } = params;
  const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

  const joinRoom = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingMessage('Finding room...');

      const formData = new FormData();
      formData.append(codeFieldName, code as string);

      const res = await fetch(room.join.url, {
        method: room.join.method,
        body: formData,
      });

      const data = await res.json();
      if (!data[codeFieldName]) {
        setLoadingMessage('Room not Found!');
        router.push('/');
      }
      setLoadingMessage('Joining room...');
    } catch (err) {
      setLoadingMessage((err as Error).message);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [code, codeFieldName, router]);

  React.useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  return (
    <div>
      {isLoading ? (
        <>
          <div className="absolute w-full z-50 h-screen flex justify-center items-center bg-black/50 flex-col gap-y-4 text-white ">
            <LoaderCircle className="scale-140 animate-spin" />
            <span className="scale-200">{loadingMessage}</span>
          </div>
        </>
      ) : null}
      <>
        <p className="text-white bg-destructive">{code}</p>
      </>
    </div>
  );
}
