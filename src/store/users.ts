import { User } from 'next-auth';
import { create } from 'zustand';
import { DataConnection, MediaConnection } from 'peerjs';

export type Profile = {
  peer: string;
  name: string;
  email: string;
  image: string;
};
export type ProfileStream = {
  cameraStream?: MediaStream;
  screenStream?: MediaStream;
};

export type Peer = { userProviderId: UserProviderId };
export type PeerConnection = {
  messageDataConnection?: DataConnection;
  cameraMediaConnection?: MediaConnection;
  screenMediaConnection?: MediaConnection;
};
export type Store = {
  profiles: {
    [id: UserProviderId]: Profile & ProfileStream;
  };
  peers: {
    [peer: string]: Peer & PeerConnection;
  };
  actions: {
    addProfile: (id: UserProviderId, profile: Profile) => void;
    addProfileCameraStream: (
      id: UserProviderId,
      cameraStream: MediaStream,
    ) => void;
    addProfileScreenStream: (
      id: UserProviderId,
      screenStream: MediaStream,
    ) => void;
    removeProfile: (id: UserProviderId) => void;
    removeProfileCameraStream: (id: UserProviderId) => void;
    removeProfileScreenStream: (id: UserProviderId) => void;
    addPeer: (peer: string, userProviderId: UserProviderId) => void;
    addPeerMessageDataConnection: (
      peer: string,
      messageDataConnection: DataConnection,
    ) => void;
    addPeerCameraMediaConnection: (
      peer: string,
      cameraMediaConnection: MediaConnection,
    ) => void;
    addPeerScreenMediaConnection: (
      peer: string,
      screenMediaConnection: MediaConnection,
    ) => void;
    removePeer: (peer: string) => void;
    addUser: (user: User, peer: string) => void;
    removeUserByProfileId: (id: UserProviderId) => void;
    removeUserByPeerId: (peer: string) => void;
  };
};

export const useUsersStore = create<Store>()((set) => ({
  profiles: {},
  peers: {},
  actions: {
    addProfile: (id: UserProviderId, profile: Profile) => {
      set((state) => ({
        ...state,
        profiles: { ...state.profiles, [id]: profile },
      }));
    },

    addProfileCameraStream: (id: UserProviderId, cameraStream: MediaStream) => {
      set((state) => ({
        ...state,
        profiles: {
          ...state.profiles,
          [id]: {
            ...state.profiles[id],
            cameraStream: cameraStream,
          },
        },
      }));
    },

    addProfileScreenStream: (id: UserProviderId, screenStream: MediaStream) => {
      set((state) => ({
        ...state,
        profiles: {
          ...state.profiles,
          [id]: {
            ...state.profiles[id],
            screenStream: screenStream,
          },
        },
      }));
    },

    removeProfile: (id: UserProviderId) => {
      if (!id) return;
      set((state) => {
        const newProfiles = { ...state.profiles };
        if (newProfiles[id]) {
          delete newProfiles[id];
        }
        return {
          ...state,
          profiles: newProfiles,
        };
      });
    },

    removeProfileCameraStream: (id: UserProviderId) => {
      if (!id) return;
      set((state) => {
        const newProfiles = { ...state.profiles };
        if (newProfiles[id].cameraStream) {
          delete newProfiles[id].cameraStream;
        }
        return {
          ...state,
          profiles: newProfiles,
        };
      });
    },

    removeProfileScreenStream: (id: UserProviderId) => {
      if (!id) return;
      set((state) => {
        const newProfiles = { ...state.profiles };
        if (newProfiles[id].screenStream) {
          delete newProfiles[id].screenStream;
        }
        return {
          ...state,
          profiles: newProfiles,
        };
      });
    },

    addPeer: (peer: string, userProviderId: UserProviderId) => {
      set((state) => ({
        ...state,
        peers: {
          ...state.peers,
          [peer]: {
            userProviderId: userProviderId,
          },
        },
      }));
    },

    addPeerMessageDataConnection: (
      peer: string,
      messageDataConnection: DataConnection,
    ) => {
      set((state) => ({
        ...state,
        peers: {
          ...state.peers,
          [peer]: {
            ...state.peers[peer],
            messageDataConnection: messageDataConnection,
          },
        },
      }));
    },

    addPeerCameraMediaConnection: (
      peer: string,
      cameraMediaConnection: MediaConnection,
    ) => {
      set((state) => ({
        ...state,
        peers: {
          ...state.peers,
          [peer]: {
            ...state.peers[peer],
            cameraMediaConnection: cameraMediaConnection,
          },
        },
      }));
    },

    addPeerScreenMediaConnection: (
      peer: string,
      screenMediaConnection: MediaConnection,
    ) => {
      set((state) => ({
        ...state,
        peers: {
          ...state.peers,
          [peer]: {
            ...state.peers[peer],
            screenMediaConnection: screenMediaConnection,
          },
        },
      }));
    },

    removePeer: (peer: string) => {
      set((state) => {
        const newPeers = { ...state.peers };
        delete newPeers[peer];
        return {
          ...state,
          peers: newPeers,
        };
      });
    },

    addUser: (user: User, peer: string) => {
      const userProviderId = user.id as UserProviderId;
      set((state) => ({
        ...state,
        profiles: {
          ...state.profiles,
          [userProviderId]: {
            ...state.profiles[userProviderId],
            peer: peer,
            name: user.name ?? '',
            email: user.email ?? '',
            image: user.image ?? '',
          },
        },
        peers: {
          ...state.peers,
          [peer]: {
            ...state.peers[peer],
            userProviderId: userProviderId,
          },
        },
      }));
    },

    removeUserByProfileId: (id: UserProviderId) => {
      set((state) => {
        const profileToRemove = state.profiles[id];
        if (!profileToRemove) {
          console.warn(`💥 Profile with UUID ${id} not found for removal.`);
          return state;
        }

        const peerToRemove = profileToRemove?.peer;

        const newProfiles = { ...state.profiles };
        delete newProfiles[id];

        const newPeers = { ...state.peers };
        if (peerToRemove) {
          delete newPeers[peerToRemove];
        }

        return {
          ...state,
          profiles: newProfiles,
          peers: newPeers,
        };
      });
    },

    removeUserByPeerId: (peer: string) => {
      set((state) => {
        const peerDataToRemove = state.peers[peer];
        if (!peerDataToRemove) {
          console.warn(`💥 Peer with ID ${peer} not found for removal.`);
          return state;
        }

        const userProviderIdToRemove = peerDataToRemove.userProviderId;

        const newProfiles = { ...state.profiles };
        delete newProfiles[userProviderIdToRemove];

        const newPeers = { ...state.peers };
        delete newPeers[peer];

        return {
          ...state,
          profiles: newProfiles,
          peers: newPeers,
        };
      });
    },
  },
}));

export const usePeers = () => useUsersStore((state) => state.peers);
export const useProfiles = () => useUsersStore((state) => state.profiles);

export const getPeer = (id: string) => useUsersStore.getState().peers[id];
export const usePeer = (id: string) =>
  useUsersStore((state) => state.peers[id]);

export const getProfile = (id: UserProviderId) =>
  useUsersStore.getState().profiles[id];
export const useProfile = (id: UserProviderId) =>
  useUsersStore((state) => state.profiles[id]);

export const useUserActions = () => useUsersStore((state) => state.actions);
