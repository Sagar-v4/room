import { create } from 'zustand';
import { CHAT_GRP_ROOM_NAME } from '@/static/const';

export type Store = {
  chats: Chat;
  actions: {
    addChat: (uuid: string) => void;
    addMessage: (uuid: string, message: Message) => void;
    readChat: (uuid: string) => void;
  };
};

type ChatData = {
  unread: number;
  lastMessageAt: number;
  messages: Message[];
};
const getInitChatData = (): ChatData => ({
  unread: 0,
  lastMessageAt: 0,
  messages: [],
});

export const useChatsStore = create<Store>()((set) => ({
  chats: {
    [CHAT_GRP_ROOM_NAME]: getInitChatData(),
  },
  actions: {
    addChat: (uuid: string) => {
      set((state) => ({
        chats: {
          ...state.chats,
          [uuid]: getInitChatData(),
        },
      }));
    },

    addMessage: (uuid: string, message: Message) => {
      set((state) => {
        if (!state.chats[uuid]) {
          console.warn(
            `💥 Attempted to add message to non-existent chat: ${uuid}. Call addChat first.`,
          );
          return state;
        }

        const currentChat = state.chats[uuid];
        return {
          chats: {
            ...state.chats,
            [uuid]: {
              ...currentChat,
              unread: currentChat.unread + 1,
              messages: [...currentChat.messages, message],
              lastMessageAt: message.timestamp,
            },
          },
        };
      });
    },

    readChat: (uuid: string) => {
      set((state) => {
        if (!state.chats[uuid]) {
          console.warn(`💥 Attempted to read non-existent chat: ${uuid}.`);
          return state;
        }
        const currentChat = state.chats[uuid];
        return {
          chats: {
            ...state.chats,
            [uuid]: {
              ...currentChat,
              unread: 0,
            },
          },
        };
      });
    },
  },
}));

export const isChatExist = (uuid: string) =>
  useChatsStore.getState().chats.hasOwnProperty(uuid);

export const useChats = () => useChatsStore((state) => state.chats);

export const useChatActions = () => useChatsStore((state) => state.actions);
