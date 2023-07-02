import type { ArgPart } from "./parse-input-string";

export function combineBareParts(parts: Array<ArgPart>): Array<ArgPart> {
  const outputParts: Array<ArgPart> = [];

  let inProgressBareContent: string = "";

  let part: ArgPart;
  const partsCopy = [...parts];
  while ((part = partsCopy.shift()!)) {
    if (part.type === "bare") {
      inProgressBareContent += part.content;
    } else {
      if (inProgressBareContent) {
        outputParts.push({ type: "bare", content: inProgressBareContent });
        inProgressBareContent = "";
      }
      outputParts.push(part);
    }
  }

  if (inProgressBareContent) {
    outputParts.push({ type: "bare", content: inProgressBareContent });
  }

  return outputParts;
}

export function stringifyArgParts(
  parts: Array<ArgPart>,
  options: { quoteBare: boolean; gapReplacement: string }
): Array<string> {
  return parts.map((part) => {
    switch (part.type) {
      case "bare": {
        if (options.quoteBare) {
          return JSON.stringify(part.content);
        } else {
          return part.content;
        }
      }
      case "single-quoted": {
        return JSON.stringify(part.content)
          .replace(/'/g, "\\'")
          .replace(/^"|"$/g, "'");
      }
      case "double-quoted": {
        return JSON.stringify(part.content);
      }
      case "gap": {
        return options.gapReplacement;
      }
      case "backticks": {
        return "`" + part.content + "`";
      }
    }
  });
}
