'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import { DataConnection, Peer } from 'peerjs';
import { useParams, useRouter } from 'next/navigation';
import { LoaderCircle, Phone, Send } from 'lucide-react';
import { room } from '@/api/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isChatExist, useChatActions, useChats } from '@/store/chats';
import { usePeers, useProfiles, useUserActions } from '@/store/users';
import {
  CHAT_GRP_ROOM_NAME,
  CODE_FIELD_NAME,
  PEER_ID_FIELD_NAME,
} from '@/static/const';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { code } = params;

  const chats = useChats();
  const peers = usePeers();
  const profiles = useProfiles();
  const { addUser, removePeer } = useUserActions();
  const { addMessage, addChat } = useChatActions();

  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingMessage, setLoadingMessage] = React.useState('Welcome!');

  const handleData = React.useCallback(
    (data: unknown, conn: DataConnection) => {
      const { type } = data as Data;
      switch (type) {
        case 'INIT_SEND': {
          addUser((data as Data).data as User, conn);
          if (session) {
            const initData: Data = {
              type: 'INIT_RECEIVED',
              data: session.user,
            };
            conn.send(initData);
          }
          break;
        }
        case 'INIT_RECEIVED': {
          addUser((data as Data).data as User, conn);
          if (session) {
            const initData: Data = {
              type: 'INIT_DONE',
              data: session.user,
            };
            conn.send(initData);
          }
          break;
        }
        case 'INIT_DONE': {
          // addUser((data as Data).data as User, conn);
          break;
        }
        case 'MSG': {
          const { from, message } = (data as Data).data as MessageData;
          if (!isChatExist(from)) {
            addChat(from);
          }
          addMessage(from, message);
          break;
        }
      }
    },
    [session, addUser, addChat, addMessage],
  );

  const openDataConnection = React.useCallback(
    (peer: Peer, remotePeerId: string) => {
      if (!remotePeerId) return;

      const conn = peer.connect(remotePeerId, { reliable: true });

      conn.on('open', () => {
        console.log('Data channel opened: openDataConnection');
        setIsLoading(false);
      });

      conn.on('data', (data) => {
        console.log('Data received: openDataConnection');
        handleData(data, conn);
      });

      conn.on('close', () => {
        console.log('Data channel closed: openDataConnection');
        removePeer(conn.peer);
      });

      conn.on('error', (err) =>
        console.error('Data channel error:openDataConnection:', err),
      );
    },
    [removePeer, handleData],
  );

  const incomingDataConnection = React.useCallback(
    (conn: DataConnection) => {
      conn.on('open', () => {
        console.log('Data channel opened: incomingDataConnection');
      });

      conn.on('data', (data) => {
        console.log('Data received: incomingDataConnection');
        handleData(data, conn);
      });

      conn.on('close', () => {
        console.log('Data channel closed: incomingDataConnection');
        removePeer(conn.peer);
      });

      conn.on('error', (err) =>
        console.error('Data channel error: incomingDataConnection:', err),
      );
    },
    [removePeer, handleData],
  );

  const joinRoom = React.useCallback(
    async (peer: Peer, localPeerId: string) => {
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
          return;
        }

        peerIds.forEach((peerId) => {
          openDataConnection(peer, peerId);
        });
      } catch (err) {
        setLoadingMessage((err as Error).message);
        router.push('/');
      }
    },
    [code, router, openDataConnection],
  );

  const leaveRoom = React.useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append(CODE_FIELD_NAME, code as string);

      await fetch(room.leave.url, {
        method: room.leave.method,
        body: formData,
      });
    } catch (err) {
      setLoadingMessage((err as Error).message);
    } finally {
      router.push('/');
    }
  }, [code, router]);

  React.useEffect(() => {
    if (status !== 'authenticated' || !session) return;

    const peer = new Peer({
      secure: true,
    });

    peer.on('open', async (peerId: string) => {
      await joinRoom(peer, peerId);
    });

    peer.on('connection', (conn: DataConnection) => {
      const data: Data = {
        type: 'INIT_SEND',
        data: session.user,
      };

      conn.on('open', () => {
        conn.send(data);
      });

      incomingDataConnection(conn);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSendGroupMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    const author = session?.user?.id;

    const message: Message = {
      author: author,
      content: (e.target as HTMLFormElement)['message'].value,
      timestamp: new Date().getTime(),
    };
    Object.values(peers).forEach(({ conn }) => {
      const data: Data = {
        type: 'MSG',
        data: {
          from: CHAT_GRP_ROOM_NAME,
          message: message,
        },
      };
      conn.send(data);
    });
    if (!isChatExist(CHAT_GRP_ROOM_NAME)) {
      addChat(CHAT_GRP_ROOM_NAME);
    }
    addMessage(CHAT_GRP_ROOM_NAME, {
      ...message,
      author: 'LOCAL',
    });
  };

  const handleSendPrivateMessage = (peerId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    const user = peers[peerId].uuid;
    const local = session?.user?.id;

    const message: Message = {
      author: 'USER',
      content: (e.target as HTMLFormElement)[peerId].value,
      timestamp: new Date().getTime(),
    };

    const data: Data = {
      type: 'MSG',
      data: {
        from: local,
        message: message,
      },
    };
    peers[peerId].conn.send(data);
    if (!isChatExist(user)) {
      addChat(user);
    }
    addMessage(user, {
      ...message,
      author: 'LOCAL',
    });
  };

  const handleLeaveRoom = React.useCallback(async () => {
    Object.values(peers).forEach(({ conn }) => {
      conn.close();
    });
    await leaveRoom();
  }, [peers, leaveRoom]);

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
          {chats[CHAT_GRP_ROOM_NAME]?.messages.map((msg, index) => (
            <div key={index.toString()}>
              <p>Author: {msg.author}</p>
              <p>Content: {msg.content}</p>
              <p>Timestamp: {new Date(msg.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="m-6">
          <form onSubmit={handleSendGroupMessage}>
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
              >
                <Send />
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="zise-8 pr-1"
                onClick={handleLeaveRoom}
              >
                <Phone />
              </Button>
            </div>
          </form>
        </div>

        {Object.values(peers).map(({ conn }) => {
          return (
            <div className="m-6" key={conn.peer}>
              <div className="p-2 border-1 overflow-scroll rounded-md">
                {chats[peers[conn.peer].uuid]?.messages.map((msg, index) => (
                  <div key={index.toString()}>
                    <p>Author: {msg.author}</p>
                    <p>Content: {msg.content}</p>
                    <p>Timestamp: {new Date(msg.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <form
                key={conn.peer}
                onSubmit={(e) => handleSendPrivateMessage(conn.peer, e)}
              >
                <div className="flex w-full max-w-sm items-center gap-2">
                  <Input
                    name={conn.peer}
                    type="text"
                    placeholder="Type a message..."
                  />
                  <Button type="submit" variant="default">
                    <Send /> {profiles[peers[conn.peer].uuid].email}
                  </Button>
                </div>
              </form>
            </div>
          );
        })}
      </>
    </div>
  );
}
