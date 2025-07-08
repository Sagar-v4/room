export function isValidUrl(str: string) {
  try {
    return new URL(str);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
}
