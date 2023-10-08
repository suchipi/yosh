import { parseInputString } from "./parse-input-string";
import { evalCivet } from "./targets/eval-civet";
import { execProgram } from "./targets/exec-program";
import { callFunction } from "./targets/call-function";
import { evalJsWithArgs } from "./targets/eval-js-with-args";
import { none } from "./targets/none";

export function determineTarget(input: string): {
  target: (input: string) => any;
  input: string;
} {
  input = input.trim();

  if (input == "") {
    return { target: none, input };
  }

  // prefix with x forces shell mode
  if (input.startsWith("x ")) {
    return { target: execProgram, input: input.slice(2) };
  }

  // prefix with j forces js mode
  if (input.startsWith("j ")) {
    return { target: evalCivet, input: input.slice(2) };
  }

  const parts = parseInputString(input);
  while (parts[0] != null && parts[0].type === "gap") {
    parts.shift();
  }

  if (parts.length === 0) {
    return { target: none, input };
  }

  const firstPart = parts[0];
  if (firstPart.type !== "bare") {
    return { target: evalCivet, input };
  }

  let firstWord: string | null = null;
  const firstWordMatches = firstPart.content.match(/(\w+)/);
  if (firstWordMatches) {
    firstWord = firstWordMatches[1];
  }

  if (firstWord != null && firstWord === firstPart.content) {
    if (
      Object.hasOwn(globalThis, firstWord) &&
      typeof globalThis[firstWord] === "function" &&
      !globalThis[firstWord].toString().startsWith("class")
    ) {
      if (parts.length === 1) {
        return { target: callFunction, input };
      } else {
        return { target: evalJsWithArgs, input };
      }
    } else {
      const binaryPath = which(firstWord);
      if (binaryPath) {
        return { target: execProgram, input };
      }
    }
  }

  return { target: evalCivet, input };
}
