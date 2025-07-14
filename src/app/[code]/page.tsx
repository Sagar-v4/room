'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { DataConnection, MediaConnection, Peer } from 'peerjs';
import { useParams, useRouter } from 'next/navigation';
import { Camera, LoaderCircle, Mic, Phone, Send } from 'lucide-react';
import { room } from '@/api/routes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { isChatExist, useChatActions, useChats } from '@/store/chats';
import {
  usePeers,
  getProfile,
  useProfiles,
  useUserActions,
} from '@/store/users';
import { useDataConnection } from '@/hooks/use-data-connection';
import {
  CHAT_GRP_ROOM_NAME,
  CODE_FIELD_NAME,
  PEER_ID_FIELD_NAME,
} from '@/static/const';
import { useMediaConnection } from '@/hooks/use-media-connection';

export default function Room() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { code } = params;

  const chats = useChats();
  const peers = usePeers();
  const profiles = useProfiles();
  const { addMessage, addChat } = useChatActions();
  const { incoming: incomingDataConnection, opening: openingDataConnection } =
    useDataConnection();
  const { incoming: incomingMediaConnection, opening: openingMediaConnection } =
    useMediaConnection();

  const { addProfile, addProfileCameraStream } = useUserActions();

  const [isLoading, setIsLoading] = React.useState(true);
  const [loadingMessage, setLoadingMessage] = React.useState('Welcome!');

  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [isVideoOn, setIsVideoOn] = React.useState(true);

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

        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const localUserProviderId = session?.user?.id as UserProviderId;
        Object.entries(data.participants).forEach(
          ([remoteUserProviderId, remotePeerId]) => {
            if (localPeerId === remotePeerId) {
              addProfile(localUserProviderId, {
                name: session?.user?.name ?? '',
                email: session?.user?.email ?? '',
                image: session?.user?.image ?? '',
                peer: localPeerId,
              });
              addProfileCameraStream(localUserProviderId, cameraStream);
            } else {
              openingDataConnection(
                peer,
                localUserProviderId,
                localPeerId,
                remoteUserProviderId as UserProviderId,
                remotePeerId,
              );

              openingMediaConnection(
                peer,
                localUserProviderId,
                localPeerId,
                remoteUserProviderId as UserProviderId,
                remotePeerId,
                cameraStream,
                'C',
              );
            }
          },
        );
      } catch (err) {
        setLoadingMessage((err as Error).message);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    },
    [
      code,
      router,
      session,
      addProfile,
      addProfileCameraStream,
      openingDataConnection,
      openingMediaConnection,
    ],
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

    peer.on('connection', (dataConnection: DataConnection) => {
      incomingDataConnection(dataConnection);
    });

    peer.on('call', (mediaConnection: MediaConnection) => {
      const incomingUserMetadata = mediaConnection.metadata
        .incoming as ConnUserMetadata;
      const user = getProfile(incomingUserMetadata.userProviderId);
      switch (mediaConnection.metadata.type as MediaStreamType) {
        case 'C': {
          incomingMediaConnection(mediaConnection, user.cameraStream);
          break;
        }
        case 'S': {
          incomingMediaConnection(mediaConnection);
          break;
        }
      }
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
    const toUserProviderId = session?.user?.id as UserProviderId;

    const message: Message = {
      author: toUserProviderId,
      content: (e.target as HTMLFormElement)['message'].value,
      timestamp: new Date().getTime(),
    };
    Object.values(peers).forEach(({ messageDataConnection }) => {
      const data: DataConnectionData = {
        type: 'MSG',
        data: {
          from: CHAT_GRP_ROOM_NAME,
          message: message,
        },
      };
      messageDataConnection?.send(data);
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
    const toUserProviderId = peers[peerId].userProviderId;
    const fromUserProviderId = session?.user?.id;

    const message: Message = {
      author: 'USER',
      content: (e.target as HTMLFormElement)[peerId].value,
      timestamp: new Date().getTime(),
    };

    const data: DataConnectionData = {
      type: 'MSG',
      data: {
        from: fromUserProviderId,
        message: message,
      },
    };
    peers[peerId].messageDataConnection?.send(data);
    if (!isChatExist(toUserProviderId)) {
      addChat(toUserProviderId);
    }
    addMessage(toUserProviderId, {
      ...message,
      author: 'LOCAL',
    });
  };

  const handleLeaveRoom = React.useCallback(async () => {
    Object.values(peers).forEach(({ messageDataConnection }) => {
      messageDataConnection?.close();
    });
    await leaveRoom();
  }, [peers, leaveRoom]);

  const toggleVideo = (localStream: MediaStream) => {
    if (localStream) {
      const tracks = localStream.getVideoTracks();
      tracks.forEach(
        (track: MediaStreamTrack) => (track.enabled = !track.enabled),
      );
      setIsVideoOn((prev) => !prev);
    }
  };

  const toggleAudio = (localStream: MediaStream) => {
    if (localStream) {
      const tracks = localStream.getAudioTracks();
      tracks.forEach(
        (track: MediaStreamTrack) => (track.enabled = !track.enabled),
      );
      setIsAudioOn((prev) => !prev);
    }
  };

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
        {session?.user?.id && (
          <>
            <div className="m-6 border-1 p-2 max-w-60">
              <p className="flex justify-between">
                <span>
                  {getProfile(session.user?.id as UserProviderId)?.name}
                </span>
              </p>
              <video
                ref={(video) => {
                  if (
                    video &&
                    getProfile(session.user?.id as UserProviderId)?.cameraStream
                  ) {
                    video.srcObject = getProfile(
                      session.user?.id as UserProviderId,
                    )?.cameraStream as MediaStream;
                  }
                }}
                autoPlay
                className="scale-x-[-1]"
              />
              <div className="flex justify-start mt-2 gap-2">
                <Button
                  type="button"
                  variant={isVideoOn ? 'default' : 'destructive'}
                  size="icon"
                  onClick={() =>
                    toggleVideo(
                      getProfile(session.user?.id as UserProviderId)
                        ?.cameraStream as MediaStream,
                    )
                  }
                >
                  <Camera />
                </Button>
                <Button
                  type="button"
                  variant={isAudioOn ? 'default' : 'destructive'}
                  size="icon"
                  onClick={() =>
                    toggleAudio(
                      getProfile(session.user?.id as UserProviderId)
                        ?.cameraStream as MediaStream,
                    )
                  }
                >
                  <Mic />
                </Button>
              </div>
            </div>
          </>
        )}
        <div className="m-6 p-2 border-1 overflow-scroll rounded-md w-fit">
          {chats[CHAT_GRP_ROOM_NAME]?.messages.map((msg, index) => (
            <div key={index.toString()}>
              <p>Author: {msg.author}</p>
              <p>Content: {msg.content}</p>
              <p>Timestamp: {new Date(msg.timestamp).toLocaleString()}</p>
              <hr />
            </div>
          ))}
          <form onSubmit={handleSendGroupMessage}>
            <div className="flex w-full max-w-sm items-center gap-2 mt-1">
              <Input
                name="message"
                type="text"
                placeholder="Type a message..."
              />
              <Button
                type="submit"
                variant="default"
                // size="icon"
                className="zise-8 pr-1"
              >
                <Send /> Group
              </Button>
              <Button
                type="button"
                variant="destructive"
                // size="icon"
                onClick={handleLeaveRoom}
              >
                <Phone /> End
              </Button>
            </div>
          </form>
        </div>

        {Object.values(peers).map(({ userProviderId }, index) => {
          const user = getProfile(userProviderId);
          if (user && user.peer) {
            return (
              <div className="m-6 w-fit" key={user.peer}>
                <div className="mb-6 p-2 border-1 overflow-scroll rounded-md">
                  <div className="m-2 max-w-60" key={index}>
                    <p className="flex justify-between">
                      <span>{user.name}</span>
                    </p>
                    <video
                      ref={(video) => {
                        if (video && user.cameraStream) {
                          video.srcObject = user.cameraStream;
                        }
                      }}
                      autoPlay
                      className="scale-x-[-1]"
                    />
                  </div>
                  {chats[peers[user.peer].userProviderId]?.messages.map(
                    (msg, index) => (
                      <div key={index.toString()}>
                        <p>Author: {msg.author}</p>
                        <p>Content: {msg.content}</p>
                        <p>
                          Timestamp: {new Date(msg.timestamp).toLocaleString()}
                        </p>
                        <hr />
                      </div>
                    ),
                  )}

                  <form
                    key={user.peer}
                    onSubmit={(e) =>
                      handleSendPrivateMessage(user.peer as string, e)
                    }
                    className="m-1"
                  >
                    <div className="flex w-full max-w-sm items-center gap-2">
                      <Input
                        name={user.peer}
                        type="text"
                        placeholder="Type a message..."
                      />
                      <Button type="submit" variant="default">
                        <Send />
                        {profiles[peers[user.peer].userProviderId].email}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            );
          }
        })}
      </>
    </div>
  );
}
