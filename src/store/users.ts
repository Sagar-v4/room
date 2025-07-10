import { User } from 'next-auth';
import { create } from 'zustand';
import { DataConnection } from 'peerjs';

export type Store = {
  profiles: {
    [id: UserProviderId]: Profile;
  };
  peers: {
    [peer: string]: {
      userProviderId: UserProviderId;
      conn: DataConnection;
    };
  };
  actions: {
    addProfile: (id: UserProviderId, profile: Profile) => void;
    removeProfile: (id: UserProviderId) => void;
    addPeer: (peer: string, conn: DataConnection) => void;
    removePeer: (peer: string) => void;
    addUser: (user: User, conn: DataConnection) => void;
    removeUserByProfileId: (id: UserProviderId) => void;
    removeUserByPeerId: (peer: string) => void;
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
    addProfile: (id: UserProviderId, profile: Profile) => {
      set((state) => ({
        ...state,
        profiles: { ...state.profiles, [id]: profile },
      }));
    },

    removeProfile: (id: UserProviderId) => {
      set((state) => {
        const newProfiles = { ...state.profiles };
        delete newProfiles[id];
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
      const userProviderId = user.id as UserProviderId;
      set((state) => ({
        ...state,
        profiles: {
          ...state.profiles,
          [userProviderId]: {
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

        const peerToRemove = profileToRemove.peer;

        const newProfiles = { ...state.profiles };
        delete newProfiles[id];

        const newPeers = { ...state.peers };
        delete newPeers[peerToRemove];

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
export const usePeer = (peer: string) =>
  useUsersStore((state) => state.peers[peer]);

export const getProfile = (id: UserProviderId) =>
  useUsersStore.getState().profiles[id];
export const useProfile = (id: UserProviderId) =>
  useUsersStore((state) => state.profiles[id]);

export const useUserActions = () => useUsersStore((state) => state.actions);
