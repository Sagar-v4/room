import * as React from 'react';
import { toast } from 'sonner';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import Peer, { DataConnection } from 'peerjs';
import { isChatExist, useChatActions } from '@/store/chats';
import { getPeer, getProfile, useUserActions } from '@/store/users';

export function useDataConnection() {
  const { data: session } = useSession();
  const { addMessage, addChat } = useChatActions();
  const { addUser, addPeerMessageDataConnection, removePeer } =
    useUserActions();

  const handle = React.useCallback(
    (data: DataConnectionData, conn: DataConnection) => {
      switch (data.type) {
        case 'CONN_INIT_DATA': {
          const user = data.data as User;

          addUser(user, conn.peer);
          addPeerMessageDataConnection(conn.peer, conn);

          toast.info(`${user.name} Joined`, {
            position: 'bottom-left',
          });
          break;
        }

        case 'MSG': {
          const { from, message } = data.data as MessageData;
          if (!isChatExist(from)) {
            addChat(from);
          }
          addMessage(from, message);
          break;
        }
      }
    },
    [addUser, addChat, addMessage, addPeerMessageDataConnection],
  );

  const opening = React.useCallback(
    (
      peer: Peer,
      localUserProviderId: UserProviderId,
      localPeerId: string,
      remoteUserProviderId: UserProviderId,
      remotePeerId: string,
    ) => {
      if (!remotePeerId) return;

      const conn = peer.connect(remotePeerId, {
        reliable: true,
        metadata: {
          opening: {
            userProviderId: localUserProviderId,
            peerId: localPeerId,
          },
          incoming: {
            userProviderId: remoteUserProviderId,
            peerId: remotePeerId,
          },
        },
      });

      conn.addListener('open', () => {
        console.info('opening: Add listener on open');
        conn.send({
          type: 'CONN_INIT_DATA',
          data: session?.user,
        });
      });

      conn.on('open', () => {
        console.info('opening: Data channel opened');
      });

      conn.on('data', (data) => {
        console.info('opening: Data received');
        handle(data as DataConnectionData, conn);
      });

      conn.on('close', () => {
        console.info('opening: Data channel closed');
        const peer = getPeer(conn.peer);
        const user = getProfile(peer.userProviderId);
        toast.info(`${user.name} Left`, {
          position: 'bottom-left',
        });
        removePeer(conn.peer);
      });

      conn.on('error', (err) =>
        console.error('opening: Data channel error', err),
      );
    },
    [session, removePeer, handle],
  );

  const incoming = React.useCallback(
    (conn: DataConnection) => {
      conn.addListener('open', () => {
        console.info('incoming: Add listener on open');
        conn.send({
          type: 'CONN_INIT_DATA',
          data: session?.user,
        });
      });

      conn.on('open', () => {
        console.info('incoming: Data channel opened');
      });

      conn.on('data', (data) => {
        console.info('incoming: Data received');
        handle(data as DataConnectionData, conn);
      });

      conn.on('close', () => {
        console.info('incoming: Data channel closed');
        const peer = getPeer(conn.peer);
        const user = getProfile(peer.userProviderId);
        toast.info(`${user.name} Left`, {
          position: 'bottom-left',
        });
        removePeer(conn.peer);
      });

      conn.on('error', (err) =>
        console.error('incoming: Data channel error', err),
      );
    },
    [session, removePeer, handle],
  );

  return {
    handle,
    opening,
    incoming,
  };
}
