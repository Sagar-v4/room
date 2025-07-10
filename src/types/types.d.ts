type Room = {
  participants: Participants;
};

type Participants = {
  [sub: string]: string;
};

/**
 * id: (grp | uuid)
 * unread: show unread cnt
 * lastMessageAt: for sorting in chat list
 * timestamp: time of msg in numbers
 * content: non empty msg data
 * author:
 *    user - local user
 *    string - uuid of user in grps
 *    null - personal received msgs
 */
type Chat = {
  [id: string]: {
    unread: number;
    lastMessageAt: number;
    messages: Message[];
  };
};
type Message = {
  timestamp: number;
  content: string;
  author: 'LOCAL' | 'USER' | string;
};
type MessageData = {
  from: string;
  message: Message;
};

type Data = {
  type: 'INIT_SEND' | 'INIT_RECEIVED' | 'INIT_DONE' | 'MSG';
  data: unknown;
};
