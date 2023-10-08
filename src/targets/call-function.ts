export function callFunction(input: string) {
  console.log(dim("-> call " + input));
  const program = globalThis[input.trim()];
  return program();
}
