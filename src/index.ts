#!/usr/bin/env yavascript
import * as std from "quickjs:std";
import { ArgPart, parseInputString } from "./parse-input-string";
import { stringifyArgParts } from "./stringify-arg-parts";

const RESET = reset("");

globalThis.prompt = function () {
  const username = $("whoami").stdout.trim();
  const hostname = $("hostname").stdout.trim();

  let dir = pwd().toString();
  if (env.HOME) {
    dir = dir.replace(new RegExp("^" + RegExp.escape(env.HOME)), "~");
  }

  return `${green(username)}${RESET}@${hostname}${RESET} ${cyan(
    dir
  )}${RESET} \$ `;
};

globalThis.x = (...parts: Array<string>) => {
  exec(parts.join(" "));
};

function handleInput(input: string) {
  globalThis._error = null;

  if (input.trim() == "") {
    return;
  }

  try {
    const parts = input.split(/\s|\b/);
    let firstPart = parts[0];
    if (firstPart == null || firstPart === "") {
      return;
    }

    let program: null | Path | ((...args: any) => any) = null;

    let targetName: string;
    let result;

    if (Object.hasOwn(globalThis, firstPart)) {
      program = globalThis[firstPart];
    } else {
      const binaryPath = which(firstPart);
      if (binaryPath) {
        program = binaryPath;
      }
    }

    if (program == null) {
      targetName = "eval js";
      console.log(dim("-> eval js: " + input));
      result = std.evalScript(input, {
        backtraceBarrier: true,
        filename: "<command-line>",
      });
    } else if (program instanceof Path) {
      targetName = "exec program";
      const execArgs = parseInputString(input)
        .filter((part) => part.type !== "gap")
        .map((part) => (part as any).content);

      console.log(dim("-> exec program: " + JSON.stringify(execArgs)));
      result = exec(execArgs, { failOnNonZeroStatus: false });
    } else if (typeof program === "function") {
      const secondPart = parts[1];
      if (secondPart == null) {
        targetName = "call function";
        console.log(dim("-> call " + firstPart));
        result = program();
      } else {
        if (secondPart.startsWith("(")) {
          targetName = "eval js";
          console.log(dim("-> eval js: " + input));
          result = std.evalScript(input, {
            backtraceBarrier: true,
            filename: "<command-line>",
          });
        } else if (input === firstPart + ".") {
          targetName = "print var";
          console.log(dim("-> print var: " + firstPart));
          result = program;
        } else {
          targetName = "eval js w/ args";

          const parts = parseInputString(input);
          const partsAfterFirst = parts.slice(1, parts.length);

          // remove leading gap if present
          if (partsAfterFirst[0] != null && partsAfterFirst[0].type === "gap") {
            partsAfterFirst.shift();
          }

          const HOME = env.HOME;
          let partsWithHomeExpanded: Array<ArgPart>;
          if (HOME) {
            partsWithHomeExpanded = partsAfterFirst.map((part) => {
              if (part.type === "bare" || part.type === "double-quoted") {
                return {
                  type: part.type,
                  content: part.content.replace(/~/g, HOME),
                };
              } else {
                return part;
              }
            });
          } else {
            partsWithHomeExpanded = partsAfterFirst;
          }

          const args = stringifyArgParts(partsWithHomeExpanded, {
            quoteBare: true,
            gapReplacement: "",
          })
            .filter(Boolean)
            .join(",");

          console.log(
            dim("-> eval js w/ args: " + firstPart + "(" + args + ")")
          );
          const wrapper = std.evalScript("(program) => program(" + args + ")");
          result = wrapper(program);
        }
      }
    } else {
      targetName = "print var";
      console.log(dim("-> print var: " + firstPart));
      result = program;
    }

    globalThis._ = result;

    // TODO yavascript needs to expose this
    if (String(result) !== "Symbol(NOTHING)") {
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
    return (globalThis.prompt as any)();
  },
});

interactivePrompt.start();
