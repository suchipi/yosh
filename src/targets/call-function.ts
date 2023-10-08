export function callFunction(input: string) {
  const functionName = input.trim();
  console.log(dim(`-> ${functionName}()`));
  const fn = globalThis[functionName];
  return fn();
}
