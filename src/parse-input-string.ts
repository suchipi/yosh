export type ArgPart =
  | {
      type: "gap";
    }
  | {
      type: "bare";
      content: string;
    }
  | {
      type: "double-quoted";
      content: string;
    }
  | {
      type: "single-quoted";
      content: string;
    }
  | {
      type: "backticks";
      content: string;
    };

const escapedChars = {
  n: "\n",
  r: "\r",
  t: "\t",
  v: "\v",
  "0": String.fromCharCode(0),
  "\\": "\\",
  "'": "'",
  '"': '"',
};

export function parseInputString(input: string): Array<ArgPart> {
  let results: Array<ArgPart> = [];

  let mode:
    | "DEFAULT"
    | "IN_DOUBLE_STRING"
    | "IN_SINGLE_STRING"
    | "IN_BACKTICKS" = "DEFAULT";
  let argBeingBuilt = "";

  function finishBareWord() {
    if (argBeingBuilt !== "") {
      results.push({ type: "bare", content: argBeingBuilt });
    }
    argBeingBuilt = "";
  }

  function finishString() {
    if (mode === "IN_DOUBLE_STRING") {
      results.push({ type: "double-quoted", content: argBeingBuilt });
      argBeingBuilt = "";
      mode = "DEFAULT";
    } else if (mode === "IN_SINGLE_STRING") {
      results.push({ type: "single-quoted", content: argBeingBuilt });
      argBeingBuilt = "";
      mode = "DEFAULT";
    } else if (mode === "IN_BACKTICKS") {
      results.push({ type: "backticks", content: argBeingBuilt });
      argBeingBuilt = "";
      mode = "DEFAULT";
    } else {
      throw new Error(
        `Internal error: cannot call finishString in mode '${mode}'`
      );
    }
  }

  function appendGap() {
    let lastResult = results.at(-1);
    if (lastResult != null && lastResult.type !== "gap") {
      results.push({ type: "gap" });
    }
  }

  const chars = input.split("");
  for (let i = 0; i < chars.length; i++) {
    const prevChar: string | null = chars[i - 1] ?? null;
    const char: string = chars[i];
    const nextChar: string | null = chars[i + 1] ?? null;

    // whitespace in default makes gaps
    if (mode === "DEFAULT" && /\s/.test(char)) {
      finishBareWord();
      appendGap();
      continue;
    }

    // start of string
    if (mode === "DEFAULT" && char === '"') {
      finishBareWord();
      mode = "IN_DOUBLE_STRING";
      continue;
    } else if (mode === "DEFAULT" && char === "'") {
      finishBareWord();
      mode = "IN_SINGLE_STRING";
      continue;
    } else if (mode === "DEFAULT" && char === "`") {
      finishBareWord();
      mode = "IN_BACKTICKS";
      continue;
    }

    // escape sequences in strings eat next char
    if (
      mode === "IN_DOUBLE_STRING" ||
      mode === "IN_SINGLE_STRING" ||
      mode === "IN_BACKTICKS"
    ) {
      if (char === "\\") {
        const nextEscapedChar = escapedChars[nextChar];
        if (nextEscapedChar != null) {
          argBeingBuilt += escapedChars[nextChar];
          i++; // skip next char
          continue;
        }
      }
    }

    // end of string
    if (mode === "IN_DOUBLE_STRING" && char === '"') {
      finishString();
      continue;
    } else if (mode === "IN_SINGLE_STRING" && char === "'") {
      finishString();
      continue;
    } else if (mode === "IN_BACKTICKS" && char === "`") {
      finishString();
      continue;
    }

    // default fall-through is to append the char and continue
    argBeingBuilt += char;
  }

  if (mode === "DEFAULT" && argBeingBuilt.length > 0) {
    finishBareWord();
  } else if (mode === "IN_DOUBLE_STRING") {
    throw new Error(
      `Invalid command string: unterminated double-quote: ${input}`
    );
  } else if (mode === "IN_SINGLE_STRING") {
    throw new Error(
      `Invalid command string: unterminated single-quote: ${input}`
    );
  }

  // find start gaps
  let startGaps = 0;
  for (const result of results) {
    if (result.type === "gap") {
      startGaps++;
    } else {
      break;
    }
  }

  // find end gaps
  let endGaps = 0;
  for (const result of [...results].reverse()) {
    if (result.type === "gap") {
      endGaps++;
    } else {
      break;
    }
  }

  // trim gaps from start and end
  results = results.slice(startGaps, results.length - endGaps);

  return results;
}
