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
      type: "curlies";
      content: string;
    }
  | {
      type: "square-brackets";
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
  "`": "`",
};

export function parseInputString(
  input: string,
  options: {
    ignore?: Array<
      | "double-quoted"
      | "single-quoted"
      | "backticks"
      | "curlies"
      | "square-brackets"
    >;
  } = {}
): Array<ArgPart> {
  let results: Array<ArgPart> = [];

  const ignoreSet = new Set(options?.ignore);
  const tokensToIgnore = {
    doubleQuoted: ignoreSet.has("double-quoted"),
    singleQuoted: ignoreSet.has("single-quoted"),
    backticks: ignoreSet.has("backticks"),
    curlies: ignoreSet.has("curlies"),
    squareBrackets: ignoreSet.has("square-brackets"),
  };

  let mode:
    | "DEFAULT"
    | "IN_DOUBLE_STRING"
    | "IN_SINGLE_STRING"
    | "IN_BACKTICKS"
    | "IN_CURLIES"
    | "IN_SQUARE_BRACKETS" = "DEFAULT";
  let argBeingBuilt = "";

  function finishBareWord() {
    if (argBeingBuilt !== "") {
      results.push({ type: "bare", content: argBeingBuilt });
    }
    argBeingBuilt = "";
  }

  function closeDelimitedSection() {
    const type = {
      IN_DOUBLE_STRING: "double-quoted",
      IN_SINGLE_STRING: "single-quoted",
      IN_BACKTICKS: "backticks",
      IN_CURLIES: "curlies",
      IN_SQUARE_BRACKETS: "square-brackets",
    }[mode];

    if (!type) {
      throw new Error(
        `Internal error: cannot call closeDelimitedSection in mode '${mode}'`
      );
    }

    results.push({ type, content: argBeingBuilt });
    argBeingBuilt = "";
    mode = "DEFAULT";
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

    // start of delimited section
    if (mode === "DEFAULT") {
      if (char === '"' && !tokensToIgnore.doubleQuoted) {
        finishBareWord();
        mode = "IN_DOUBLE_STRING";
        continue;
      } else if (char === "'" && !tokensToIgnore.singleQuoted) {
        finishBareWord();
        mode = "IN_SINGLE_STRING";
        continue;
      } else if (char === "`" && !tokensToIgnore.backticks) {
        finishBareWord();
        mode = "IN_BACKTICKS";
        continue;
      } else if (char === "{" && !tokensToIgnore.curlies) {
        finishBareWord();
        mode = "IN_CURLIES";
        continue;
      } else if (char === "[" && !tokensToIgnore.squareBrackets) {
        finishBareWord();
        mode = "IN_SQUARE_BRACKETS";
        continue;
      }
    }

    // string escape sequences in strings eat next char
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

    // end of delimited section
    if (char === '"' && mode === "IN_DOUBLE_STRING") {
      closeDelimitedSection();
      continue;
    } else if (char === "'" && mode === "IN_SINGLE_STRING") {
      closeDelimitedSection();
      continue;
    } else if (char === "`" && mode === "IN_BACKTICKS") {
      closeDelimitedSection();
      continue;
    } else if (char === "}" && mode === "IN_CURLIES") {
      closeDelimitedSection();
      continue;
    } else if (char === "]" && mode === "IN_SQUARE_BRACKETS") {
      closeDelimitedSection();
      continue;
    }

    // default fall-through is to append the char and continue
    argBeingBuilt += char;
  }

  if (mode === "DEFAULT" && argBeingBuilt.length > 0) {
    finishBareWord();
  } else if (mode === "IN_DOUBLE_STRING") {
    throw new Error(
      `Invalid command string: unterminated double-quoted string: ${input}`
    );
  } else if (mode === "IN_SINGLE_STRING") {
    throw new Error(
      `Invalid command string: unterminated single-quoted string: ${input}`
    );
  } else if (mode === "IN_BACKTICKS") {
    throw new Error(
      `Invalid command string: unterminated template literal (backtick string): ${input}`
    );
  } else if (mode === "IN_CURLIES") {
    throw new Error(
      `Invalid command string: no '}' to match opening '{': ${input}`
    );
  } else if (mode === "IN_SQUARE_BRACKETS") {
    throw new Error(
      `Invalid command string: no ']' to match opening '[': ${input}`
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
