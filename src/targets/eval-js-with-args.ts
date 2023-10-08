import { parseInputString, ArgPart } from "../parse-input-string";
import { stringifyArgParts } from "../stringify-arg-parts";

export function evalJsWithArgs(input: string) {
  const parts = parseInputString(input);
  const partsAfterFirst = parts.slice(1, parts.length);

  // remove leading gap if present
  if (partsAfterFirst[0] != null && partsAfterFirst[0].type === "gap") {
    partsAfterFirst.shift();
  }

  const firstPart: Exclude<ArgPart, { type: "gap" }> = parts[0] as any;

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

  const functionName = firstPart.content;

  console.log(dim(`-> ${functionName}(${args})`));
  const wrapper = std.evalScript("(fn) => fn(" + args + ")");
  const fn = globalThis[functionName];
  return wrapper(fn);
}
