/**
 * Represents a unique user ID, typically from an OAuth provider.
 * Format: "provider:number" (e.g., "google:12345", "github:98765")
 */
type UserProviderId = `${string}:${string | number}`;

/**
 * Represents the structured components of a UserProviderId.
 */
type DecodedUserProviderId = {
  provider: string;
  id: number;
};

/**
 * Represents the type of communication that can be blocked between users.
 * - 'A': Audio communication
 * - 'V': Video communication
 * - 'C': Chat/Text communication
 */
type BlockType = 'A' | 'V' | 'C';

/**
 * Represents a unique identifier for a specific communication block between two users.
 * The format is "blockerUserId-blockedUserId-blockType".
 *
 * Example: "google:12345-github:67890-A" signifies that the user with Google ID 12345
 * has blocked audio communication from the user with GitHub ID 67890.
 */
type BlockId = `${UserProviderId}-${UserProviderId}-${BlockType}`;

/**
 * Represents the structured, decoded form of a BlockId string.
 * This type provides a more convenient way to access the individual components
 * of a block relationship after parsing a BlockId string.
 */
type DecodedBlockId = {
  /** The UserProviderId of the user who initiated the block. */
  from: UserProviderId;
  /** The UserProviderId of the user who is being blocked. */
  to: UserProviderId;
  /** The type of communication being blocked (Audio, Video, or Chat). */
  type: BlockType;
};

/**
 * A dictionary mapping `UserProviderId` to a user's peer id.
 * This can be used to track who is participating in a room or call.
 *
 * The key is the unique `UserProviderId` of a participant.
 * The value is peer id.
 */
type Participants = {
  [userId: UserProviderId]: string;
};

/**
 * Represents the state of a single communication room or session.
 * It includes information about the participants and any active communication blocks within the room.
 */
type Room = {
  /** A map of participants currently in the room, indexed by their UserProviderId. */
  participants: Participants;
  /** An array of BlockId strings, representing active communication blocks in the room. */
  blocks: BlockId[];
};

/**
 * Represents a collection of individual chat conversations, indexed by the UserProviderId
 * of the peer with whom the conversation is taking place.
 * This structure effectively maps each unique user ID to their corresponding conversation data.
 */
type Chat = {
  /**
   * The key is the `UserProviderId` of the other participant in this direct message conversation.
   * The value is a `Conversation` object, holding the chat history and metadata for that specific peer.
   */
  [id: UserProviderId]: Conversation;
};

/**
 * Represents the detailed state and content of a single chat conversation.
 * This type encapsulates all the necessary information for displaying and managing
 * a conversation with a specific user or entity.
 */
type Conversation = {
  /** The number of unread messages in this conversation. Used for displaying notifications or badges. */
  unread: number;
  /** The timestamp (in milliseconds since epoch) of the most recent message in this conversation.
   * This is typically used for sorting conversations in a chat list.
   */
  lastMessageAt: number;
  /** An array containing all the messages exchanged within this particular conversation. */
  messages: Message[];
};

/**
 * Represents a single message within a chat conversation.
 */
type Message = {
  /** The timestamp when the message was sent (in milliseconds since epoch). */
  timestamp: number;
  /** The actual content of the message (non-empty string). */
  content: string;
  /**
   * Defines the author of the message:
   * - 'LOCAL': The message was sent by the local user (current application user).
   * - 'USER': The message was sent by another user in a private chat (author's UserProviderId would be used from key).
   * - `UserProviderId`: For group messages, this could be the UserProviderId of the sender,
   * or for internal system messages, it might denote a specific system entity.
   */
  author: 'LOCAL' | 'USER' | UserProviderId;
};

/**
 * Represents the structured data for a message being transmitted or received,
 * including who it's from and the message content itself.
 */
type MessageData = {
  /** The UserProviderId of the sender of the message. */
  from: UserProviderId;
  /** The actual message content and metadata. */
  message: Message;
};

/**
 * Represents a generic data packet transmitted over a connection, indicating its type and payload.
 * Used for signaling different actions or information exchange in a peer-to-peer or client-server setup.
 */
type DataConnectionData = {
  /**
   * The type of data being transmitted, indicating the purpose of the payload:
   * - 'CONN_INIT': Initial data being sent to establish a connection or state.
   * - 'MSG': A regular message data packet.
   */
  type: 'CONN_INIT' | 'CONN_INIT_DATA' | 'MSG';
  /** The actual payload of the data packet. Its type depends on the 'type' field. */
  data: unknown; // 'unknown' is used as the specific type depends on the 'type' field.
};

/**
 * Represents the type of media stream.
 * - 'C': Camera
 * - 'S': Screen
 */
type MediaStreamType = 'C' | 'S';

/**
 * Represents metadata associated with a connected user's PeerJS DataConnection.
 * This type bundles the user's unique provider-specific ID with their PeerJS connection ID,
 * facilitating easy lookup and management of connected peers.
 */
type ConnUserMetadata = {
  /**
   * The unique identifier for the user from their authentication provider (e.g., "google:12345").
   * This ID is used for application-level user identification.
   */
  userProviderId: UserProviderId;
  /**
   * The PeerJS ID (a string) assigned to this user's connection.
   * This ID is used for establishing and managing peer-to-peer connections via PeerJS.
   */
  peerId: string;
};
