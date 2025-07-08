'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import Peer, { DataConnection } from 'peerjs';
import { LoaderCircle, Send } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { room } from '@/api/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CODE_FIELD_NAME, PEER_ID_FIELD_NAME } from '@/static/const';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { code } = params;

  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingMessage, setLoadingMessage] = React.useState('Welcome!');

  const [messages, setMessages] = React.useState<string[]>([]); // msg = author:content:timestamp:etc

  const dataConnectionRef = React.useRef<DataConnection>(null);

  const connectRoom = async (peer: Peer, localPeerId: string) => {
    try {
      const formData = new FormData();
      formData.append(CODE_FIELD_NAME, code as string);
      formData.append(PEER_ID_FIELD_NAME, localPeerId as string);

      const res = await fetch(room.join.url, {
        method: room.join.method,
        body: formData,
      });

      const data: Room & { [CODE_FIELD_NAME]: string } = await res.json();
      if (!data[CODE_FIELD_NAME]) {
        setLoadingMessage('Room not Found!');
        router.push('/');
      }

      const peerIds = Object.values(data.participants).filter(
        (peerId) => peerId !== localPeerId,
      );

      if (!peerIds.length) {
        setIsLoading(false);
      }

      peerIds.forEach((peerId) => {
        openDataConnection(peer, peerId);
      });
    } catch (err) {
      setLoadingMessage((err as Error).message);
      router.push('/');
    }
  };

  const handleIncomingDataConnection = (conn: DataConnection) => {
    dataConnectionRef.current = conn;

    conn.on('open', () => {
      console.log('Data channel opened.');
    });

    conn.on('data', (data) => {
      setMessages((prev) => [...prev, `${data}`]);
    });

    conn.on('close', () => {
      console.log('Data channel closed.');
      dataConnectionRef.current = null;
    });

    conn.on('error', (err) => console.error('Data channel error:', err));
  };

  const openDataConnection = (peer: Peer, remotePeerId: string) => {
    if (!remotePeerId) return;

    const conn = peer.connect(remotePeerId, { reliable: true });
    dataConnectionRef.current = conn;

    conn.on('open', () => {
      console.log('Data channel opened.');
      setIsLoading(false);
    });

    conn.on('data', (data) => {
      setMessages((prev) => [...prev, `${data}`]);
    });

    conn.on('close', () => {
      console.log('Data channel closed.');
      dataConnectionRef.current = null;
    });

    conn.on('error', (err) => console.error('Data channel error:', err));
  };

  React.useEffect(() => {
    setIsLoading(true);

    const peer = new Peer({
      secure: true,
    });

    peer.on('open', async (peerId: string) => {
      await connectRoom(peer, peerId);
    });

    peer.on('connection', (conn: DataConnection) => {
      console.log('Received data connection from:', conn.peer);
      handleIncomingDataConnection(conn);
    });

    peer.on('close', () => {
      console.log('Closing PeerJs');
    });

    peer.on('error', (err) => {
      console.log('PeerJS error:', err);
      toast.error(`${err.type} - ${err.name}`, {
        description: err.message,
      });
    });

    return () => {
      if (peer) {
        peer.destroy();
      }
    };
  }, []);

  const handleSendMessage = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (dataConnectionRef.current && dataConnectionRef.current.open) {
        const data = (e.target as HTMLFormElement)['message'].value;
        const message = `${session?.user?.name}: ${data} - ${new Date().toLocaleString()}`;
        dataConnectionRef.current.send(message);
        setMessages((prev) => [...prev, `(You)${message}`]);
      } else {
        console.warn('Data connection not open.');
      }
    },
    [session],
  );

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
        <div className="m-6 p-2 border-1 overflow-scroll rounded-md">
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
        </div>

        <div className="m-6">
          <form onSubmit={handleSendMessage}>
            <div className="flex w-full max-w-sm items-center gap-2">
              <Input
                name="message"
                type="text"
                placeholder="Type a message..."
              />
              <Button
                type="submit"
                variant="default"
                size="icon"
                className="zise-8 pr-1"
                disabled={
                  !dataConnectionRef.current || !dataConnectionRef.current.open
                }
              >
                <Send />
              </Button>
            </div>
          </form>
        </div>
      </>
    </div>
  );
}
