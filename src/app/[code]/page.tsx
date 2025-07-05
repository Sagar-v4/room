'use client';

import * as React from 'react';
import { LoaderCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const { code } = params;
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const joinRoom = async () => {
      setIsLoading(true);
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

        const formData = new FormData();
        formData.append('code', code as string);

        const res = await fetch(`${API_URL}/api/room/join`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!data.code) {
          router.push('/');
        }
      } catch (err) {
        console.log('🚀 ~ joinRoom ~ err:', err);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    joinRoom();
  }, []); // eslint-disable-line

  return (
    <>
      {isLoading ? (
        <div className="h-screen flex justify-center items-center">
          <LoaderCircle className="scale-200 animate-spin" />
        </div>
      ) : (
        <>Not Loading</>
      )}
    </>
  );
}
