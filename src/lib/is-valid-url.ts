export function isValidUrl(str: string) {
  try {
    new URL(str);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
}
