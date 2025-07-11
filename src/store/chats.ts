import { create } from 'zustand';
import { CHAT_GRP_ROOM_NAME } from '@/static/const';

export type Store = {
  chats: Chat;
  actions: {
    addChat: (id: UserProviderId) => void;
    addMessage: (id: UserProviderId, message: Message) => void;
    readChat: (id: UserProviderId) => void;
  };
};

const getInitConversationData = (): Conversation => ({
  unread: 0,
  lastMessageAt: 0,
  messages: [],
});

export const useChatsStore = create<Store>()((set) => ({
  chats: {
    [CHAT_GRP_ROOM_NAME]: getInitConversationData(),
  },
  actions: {
    addChat: (id: UserProviderId) => {
      set((state) => ({
        chats: {
          ...state.chats,
          [id]: getInitConversationData(),
        },
      }));
    },

    addMessage: (id: UserProviderId, message: Message) => {
      set((state) => {
        if (!state.chats[id]) {
          console.warn(
            `💥 Attempted to add message to non-existent chat: ${id}. Call addChat first.`,
          );
          return state;
        }

        const currentChat = state.chats[id];
        return {
          chats: {
            ...state.chats,
            [id]: {
              ...currentChat,
              unread: currentChat.unread + 1,
              messages: [...currentChat.messages, message],
              lastMessageAt: message.timestamp,
            },
          },
        };
      });
    },

    readChat: (id: UserProviderId) => {
      set((state) => {
        if (!state.chats[id]) {
          console.warn(`💥 Attempted to read non-existent chat: ${id}.`);
          return state;
        }
        const currentChat = state.chats[id];
        return {
          chats: {
            ...state.chats,
            [id]: {
              ...currentChat,
              unread: 0,
            },
          },
        };
      });
    },
  },
}));

export const isChatExist = (id: UserProviderId) =>
  useChatsStore.getState().chats.hasOwnProperty(id);

export const useChats = () => useChatsStore((state) => state.chats);

export const useChatActions = () => useChatsStore((state) => state.actions);
