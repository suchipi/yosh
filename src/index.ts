#!/usr/bin/env yavascript
import { defaultPrompt } from "./default-prompt";
import { determineTarget } from "./determine-target";
import { execProgram } from "./targets/exec-program";

globalThis.prompt = defaultPrompt;

// TODO yavascript needs to expose NOTHING somehow
function isNothing(value: unknown) {
  try {
    return String(value) === "Symbol(NOTHING)";
  } catch {
    return false;
  }
}

function isBoringExecResult(value: unknown) {
  // {
  //   status: 0
  //   signal: undefined
  // }

  return (
    typeof value === "object" &&
    value != null &&
    Object.keys(value).length === 2 &&
    (value as any).status === 0 &&
    (value as any).signal === undefined
  );
}

function handleInput(rawInput: string) {
  try {
    const { target, input } = determineTarget(rawInput);
    const result = target(input);
    globalThis._ = result;

    if (!is(result, types.undefined) && !isNothing(result)) {
      if (isBoringExecResult(result) && target === execProgram) {
        // don't print anything
      } else {
        console.log(result);
      }
    }
  } catch (err) {
    globalThis._error = err;
    console.error(err);
  }
}

const interactivePrompt = new InteractivePrompt(handleInput, {
  historyFileName: "yosh_repl_history.txt",
  prompt: () => {
    const currentPrompt = globalThis.prompt;
    if (typeof currentPrompt === "function") {
      const result = currentPrompt();
      return String(result);
    } else {
      console.error(red("global.prompt is not a function"));
      return defaultPrompt();
    }
  },
});

interactivePrompt.start();
