import * as engine from "quickjs:engine";

export function evalCivet(input: string) {
  const jsCode = yavascript.compilers.civet(input, {
    filename: "<command-line>",
  });

  console.log(dim("-> " + jsCode));
  return engine.evalScript(jsCode, {
    backtraceBarrier: true,
    filename: "<command-line>",
  });
}
