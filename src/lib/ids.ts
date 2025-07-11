/**
 * Encodes a provider string and a numeric ID into a UserProviderId string.
 * @param provider The name of the authentication provider (e.g., "google", "github").
 * @param id The numeric ID from the provider.
 * @returns A UserProviderId string in the format "provider:id".
 */
export function encodeUserProviderId(
  provider: string,
  id: string | number,
): UserProviderId {
  return `${provider}:${id}` as UserProviderId;
}

/**
 * Decodes a UserProviderId string back into its provider and numeric ID components.
 * @param userProviderId The UserProviderId string to decode.
 * @returns A DecodedUserProviderId object, or null if the string format is invalid.
 */
export function decodeUserProviderId(
  userProviderId: string,
): DecodedUserProviderId | null {
  const parts = userProviderId.split(':');

  // Check if there are exactly two parts
  if (parts.length !== 2) {
    return null;
  }
  const [provider, idStr] = parts;

  // Validate that the ID part is a valid number
  const id = Number(idStr);
  if (isNaN(id)) {
    return null;
  }

  // Ensure the provider string is not empty (optional, but good practice)
  if (provider.trim() === '') {
    return null;
  }

  return {
    provider,
    id,
  };
}

/**
 * Validates if a given string conforms to the UserProviderId format.
 * A UserProviderId is expected to be in the format "provider:number" (e.g., "google:12345").
 *
 * This function acts as a TypeScript type guard, meaning if it returns true,
 * TypeScript will narrow the type of the input 'id' to 'UserProviderId' within that scope.
 *
 * @param id The string to validate.
 * @returns True if the string matches the UserProviderId format, otherwise false.
 */
export const isValidUserProviderId = (id: string): id is UserProviderId => {
  const idParts = id.split(':');
  return idParts.length === 2 && !isNaN(Number(idParts[1]));
};

/**
 * Validates if a given string is a valid BlockType.
 * Valid BlockTypes are 'A' (Audio), 'V' (Video), or 'C' (Chat).
 *
 * This function acts as a TypeScript type guard, meaning if it returns true,
 * TypeScript will narrow the type of the input 'type' to 'BlockType' within that scope.
 *
 * @param type The string to validate.
 * @returns True if the string is 'A', 'V', or 'C', otherwise false.
 */
export const isValidBlockType = (type: string): type is BlockType => {
  // Audio | Video | Chat
  return type === 'A' || type === 'V' || type === 'C';
};

/**
 * Encodes blocker and blocked user IDs with a specific block type into a BlockId string.
 * @param from The UserProviderId of the user performing the block.
 * @param to The UserProviderId of the user being blocked.
 * @param type The type of communication to block (Audio, Video, Chat).
 * @returns A BlockId string in the format "from-to-type".
 */
export function encodeBlockId(
  from: UserProviderId,
  to: UserProviderId,
  type: BlockType,
): BlockId {
  return `${from}-${to}-${type}` as BlockId;
}

/**
 * Decodes a BlockId string back into its constituent parts.
 * @param blockId The BlockId string to decode.
 * @returns A DecodedBlock object containing blockerId, blockedId, and type,
 * or null if the string format is invalid.
 */
export function decodeBlockId(blockId: string): DecodedBlockId | null {
  const parts = blockId.split('-');

  // Ensure there are exactly three parts
  if (parts.length !== 3) {
    return null;
  }

  const [from, to, type] = parts;

  // Validate blockerId and blockedId
  if (!isValidUserProviderId(from) || !isValidUserProviderId(to)) {
    return null;
  }

  if (!isValidBlockType(type)) {
    return null;
  }

  return {
    from: from as UserProviderId,
    to: to as UserProviderId,
    type: type,
  };
}
