export function evalJs(input: string) {
  console.log(dim("-> " + input));
  return std.evalScript(input, {
    backtraceBarrier: true,
    filename: "<command-line>",
  });
}
