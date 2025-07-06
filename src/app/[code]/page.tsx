'use client';

import * as React from 'react';
import { LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { room } from '@/api/routes';
import { toast } from 'sonner';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const { code } = params;
  const codeFieldName = String(process.env.ROOM_CODE_FIELD_NAME);

  const joinRoom = React.useCallback(async () => {
    try {
      setIsLoading(true);

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
      setIsLoading(false);
    }
  }, [code, codeFieldName, router]);

  React.useEffect(() => {
    joinRoom();
  }, [joinRoom]);

  return (
    <>
      {isLoading ? (
        <div className="h-screen flex justify-center items-center">
          <LoaderCircle className="scale-200 animate-spin" />
        </div>
      ) : (
        <>{code}</>
      )}
    </>
  );
}
