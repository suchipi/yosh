#!/usr/bin/env yavascript
import { defaultPrompt } from "./default-prompt";
import { determineTarget } from "./determine-target";
import { execProgram } from "./targets/exec-program";

// suppress exec logging
logger.info = () => {};

globalThis.prompt = defaultPrompt;

function isBoringExecResult(value: unknown) {
  // {
  //   status: 0
  //   signal: undefined
  // }

  try {
    return (
      typeof value === "object" &&
      value != null &&
      Object.keys(value).length === 2 &&
      (value as any).status === 0 &&
      (value as any).signal === undefined
    );
  } catch (err) {
    return false;
  }
}

function handleInput(rawInput: string) {
  try {
    const { target, input } = determineTarget(rawInput);
    const result = target(input);
    globalThis._ = result;

    if (!is(result, types.undefined) && result !== startRepl.NOTHING) {
      if (target === execProgram && isBoringExecResult(result)) {
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
