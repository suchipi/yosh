import * as std from "quickjs:std";
import { parseInputString } from "./parse-input-string";
import { interpolateVars } from "./interpolate-vars";
import { isJs } from "./is-valid-js";
import { combineBareParts, stringifyArgParts } from "./part-utils";

while (true) {
  std.out.puts("$ ");
  const line = std.in.getline();
  if (line == null) break;

  try {
    const parts = parseInputString(line);
    const firstPart = parts[0];
    if (firstPart == null) {
      continue;
    }

    let mode: "INVOCATION" | "RAW_JS";

    const secondPart = parts[1];
    if (
      firstPart.type === "bare" &&
      /^[A-Za-z0-9\-_$@]+$/.test(firstPart.content) &&
      (secondPart == null || secondPart.type === "gap")
    ) {
      // treat as program invocation syntax
      mode = "INVOCATION";
    } else {
      mode = "RAW_JS";
    }

    let code: string;
    if (mode === "RAW_JS") {
      code = line;
    } else if (mode === "INVOCATION") {
      const programName = (parts[0] as (typeof parts)[0] & { type: "bare" })
        .content;
      const programArgs: Array<string> = [];

      const partsWithBarePartsCombined = combineBareParts(parts.slice(1));
      const partsWithoutGaps = partsWithBarePartsCombined.filter(
        (part) => part.type === "gap"
      );
    }

    console.log(result);
  } catch (err) {
    console.error(err);
  }
}
