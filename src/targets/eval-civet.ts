export function evalCivet(input: string) {
  const jsCode = yavascript.compilers.civet(input, {
    filename: "<command-line>",
  });

  console.log(dim("-> " + jsCode));
  return std.evalScript(jsCode, {
    backtraceBarrier: true,
    filename: "<command-line>",
  });
}
