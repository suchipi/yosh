export function evalJs(input: string) {
  console.log(dim("-> eval js: " + input));
  return std.evalScript(input, {
    backtraceBarrier: true,
    filename: "<command-line>",
  });
}
