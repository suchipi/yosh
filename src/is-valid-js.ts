export function isJs(input: string): boolean {
  try {
    new Function(input);
    return true;
  } catch (err) {
    return false;
  }
}
