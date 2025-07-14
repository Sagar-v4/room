/**
 * Generates a unique room code in the format `xxx-xxxx-xxx`,
 * where 'x' represents a lowercase alphanumeric character (a-z or 0-9).
 * The code consists of three segments separated by hyphens:
 * - A 3-character prefix.
 * - A 4-character middle segment.
 * - A 3-character suffix.
 *
 * The characters are randomly selected from a predefined set of lowercase
 * letters and digits.
 *
 * @returns {string} A newly generated room code (e.g., "abc-1234-def").
 */
export function generate(): string {
  // Define the set of characters allowed in the generated code.
  // This includes all lowercase letters (a-z) and digits (0-9).
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = ''; // Initialize an empty string to build the code.

  // --- Generate the first 3 characters (prefix) ---
  // Loop 3 times to create the first segment of the code.
  for (let i = 0; i < 3; i++) {
    // Generate a random index within the bounds of the 'characters' string length.
    const randomIndex = Math.floor(Math.random() * characters.length);
    // Append the character at the random index to the 'code' string.
    code += characters.charAt(randomIndex);
  }
  // Add a hyphen separator after the first segment.
  code += '-';

  // --- Generate the middle 4 characters ---
  // Loop 4 times to create the second segment of the code.
  for (let i = 0; i < 4; i++) {
    // Generate a random index and append the character.
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  // Add a hyphen separator after the second segment.
  code += '-';

  // --- Generate the last 3 characters (suffix) ---
  // Loop 3 times to create the third segment of the code.
  for (let i = 0; i < 3; i++) {
    // Generate a random index and append the character.
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }

  // Return the complete generated code string.
  return code;
}

/**
 * Validates if a given code string conforms to the expected format: xxx-xxxx-xxx
 * where x is an alphanumeric character (a-z, 0-9).
 *
 * @param {string} code The code string to validate.
 * @returns {boolean} True if the code is in the correct format, false otherwise.
 */
export function verify(code: string): boolean {
  if (typeof code !== 'string') {
    return false; // Code must be a string
  }

  // Regex breakdown:
  // ^       - start of the string
  // [a-z0-9]{3} - exactly 3 lowercase alphanumeric characters
  // -       - literal hyphen
  // [a-z0-9]{4} - exactly 4 lowercase alphanumeric characters
  // -       - literal hyphen
  // [a-z0-9]{3} - exactly 3 lowercase alphanumeric characters
  // $       - end of the string
  const codeRegex = /^[a-z0-9]{3}-[a-z0-9]{4}-[a-z0-9]{3}$/;

  return codeRegex.test(code);
}
