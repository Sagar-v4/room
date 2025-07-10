import { User } from 'next-auth';
import { create } from 'zustand';
import { DataConnection } from 'peerjs';

export type Store = {
  profiles: {
    [uuid: string]: Profile;
  };
  peers: {
    [peer: string]: {
      uuid: string;
      conn: DataConnection;
    };
  };
  actions: {
    addProfile: (uuid: string, profile: Profile) => void;
    removeProfile: (uuid: string) => void;
    addPeer: (peer: string, conn: DataConnection) => void;
    removePeer: (peer: string) => void;
    addUser: (user: User, conn: DataConnection) => void;
    removeUserByProfileUUID: (uuid: string) => void;
    removeUserByPeerID: (peer: string) => void;
  };
};

export type Profile = {
  peer: string;
  name: string;
  email: string;
  image: string;
};

export const useUsersStore = create<Store>()((set) => ({
  profiles: {},
  peers: {},
  actions: {
    addProfile: (uuid: string, profile: Profile) => {
      set((state) => ({
        ...state,
        profiles: { ...state.profiles, [uuid]: profile },
      }));
    },

    removeProfile: (uuid: string) => {
      set((state) => {
        const newProfiles = { ...state.profiles };
        delete newProfiles[uuid];
        return {
          ...state,
          profiles: newProfiles,
        };
      });
    },

    addPeer: (peer: string, conn: DataConnection) => {
      set((state) => ({
        ...state,
        peers: {
          ...state.peers,
          [peer]: {
            ...state.peers[peer],
            conn: conn,
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

    addUser: (user: User, conn: DataConnection) => {
      set((state) => ({
        ...state,
        profiles: {
          ...state.profiles,
          [String(user.id)]: {
            peer: conn.peer,
            name: user.name ?? '',
            email: user.email ?? '',
            image: user.image ?? '',
          },
        },
        peers: {
          ...state.peers,
          [conn.peer]: {
            conn: conn,
            uuid: String(user.id),
          },
        },
      }));
    },

    removeUserByProfileUUID: (uuid: string) => {
      set((state) => {
        const profileToRemove = state.profiles[uuid];
        if (!profileToRemove) {
          console.warn(`💥 Profile with UUID ${uuid} not found for removal.`);
          return state;
        }

        const peerToRemove = profileToRemove.peer;

        const newProfiles = { ...state.profiles };
        delete newProfiles[uuid];

        const newPeers = { ...state.peers };
        delete newPeers[peerToRemove];

        return {
          ...state,
          profiles: newProfiles,
          peers: newPeers,
        };
      });
    },

    removeUserByPeerID: (peer: string) => {
      set((state) => {
        const peerDataToRemove = state.peers[peer];
        if (!peerDataToRemove) {
          console.warn(`💥 Peer with ID ${peer} not found for removal.`);
          return state;
        }

        const uuidToRemove = peerDataToRemove.uuid;

        const newProfiles = { ...state.profiles };
        delete newProfiles[uuidToRemove];

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
export const usePeer = (peer: string) =>
  useUsersStore((state) => state.peers[peer]);

export const useProfiles = () => useUsersStore((state) => state.profiles);
export const useProfile = (uuid: string) =>
  useUsersStore((state) => state.profiles[uuid]);

export const useUserActions = () => useUsersStore((state) => state.actions);
