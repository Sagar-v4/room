import * as React from 'react';
import { toast } from 'sonner';
import Peer, { MediaConnection } from 'peerjs';
import { getProfile, useUserActions } from '@/store/users';

export function useMediaConnection() {
  const {
    addProfileCameraStream,
    addProfileScreenStream,
    removeProfileCameraStream,
    removeProfileScreenStream,
  } = useUserActions();

  const opening = React.useCallback(
    (
      peer: Peer,
      localUserProviderId: UserProviderId,
      localPeerId: string,
      remoteUserProviderId: UserProviderId,
      remotePeerId: string,
      stream: MediaStream,
      type: MediaStreamType,
    ) => {
      if (!remotePeerId) return;

      const conn = peer.call(remotePeerId, stream, {
        metadata: {
          type: type,
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

      conn.on('stream', (stream) => {
        console.log('opening: Media channel streaming');
        switch (type) {
          case 'C': {
            addProfileCameraStream(remoteUserProviderId, stream);
            break;
          }
          case 'S': {
            addProfileScreenStream(remoteUserProviderId, stream);
            break;
          }
        }
      });

      conn.on('close', () => {
        console.log('opening: Media channel closed');

        switch (type) {
          case 'C': {
            removeProfileCameraStream(remoteUserProviderId);
            break;
          }
          case 'S': {
            removeProfileScreenStream(remoteUserProviderId);
            break;
          }
        }
        const user = getProfile(remoteUserProviderId);
        toast.info(`${user.name} Left | type: ${type}`, {
          position: 'bottom-left',
        });
      });

      conn.on('error', (err) =>
        console.error('opening: Media channel error', err),
      );
    },
    [
      addProfileCameraStream,
      addProfileScreenStream,
      removeProfileCameraStream,
      removeProfileScreenStream,
    ],
  );

  const incoming = React.useCallback(
    (conn: MediaConnection, stream?: MediaStream) => {
      if (stream) {
        conn.answer(stream);
      } else {
        conn.answer();
      }

      const connUserMetadata = conn.metadata.opening as ConnUserMetadata;

      conn.on('stream', (stream) => {
        console.log('incoming: Media channel streaming: ', stream);
        switch (conn.metadata.type as MediaStreamType) {
          case 'C': {
            addProfileCameraStream(connUserMetadata.userProviderId, stream);
            break;
          }
          case 'S': {
            addProfileScreenStream(connUserMetadata.userProviderId, stream);
            break;
          }
        }
      });

      conn.on('close', () => {
        console.log('incoming: Media channel closed');
        switch (conn.metadata.type as MediaStreamType) {
          case 'C': {
            removeProfileCameraStream(connUserMetadata.userProviderId);
            break;
          }
          case 'S': {
            removeProfileScreenStream(connUserMetadata.userProviderId);
            break;
          }
        }
        const user = getProfile(connUserMetadata.userProviderId);
        toast.info(`${user.name} Left | type: ${conn.metadata.type}`, {
          position: 'bottom-left',
        });
      });

      conn.on('error', (err) =>
        console.error('incoming: Media channel error', err),
      );
    },
    [
      addProfileCameraStream,
      addProfileScreenStream,
      removeProfileCameraStream,
      removeProfileScreenStream,
    ],
  );

  return {
    opening,
    incoming,
  };
}
