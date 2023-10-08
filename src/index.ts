#!/usr/bin/env yavascript
import { defaultPrompt } from "./default-prompt";
import { determineTarget } from "./determine-target";

globalThis.prompt = defaultPrompt;

function handleInput(rawInput: string) {
  try {
    const { target, input } = determineTarget(rawInput);
    const result = target(input);
    globalThis._ = result;

    // TODO yavascript needs to expose NOTHING somehow
    if (!is(result, types.undefined) && String(result) !== "Symbol(NOTHING)") {
      console.log(result);
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
