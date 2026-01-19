import type { ArgPart } from "./parse-input-string";

export function stringifyArgParts(
  parts: Array<ArgPart>,
  options: { quoteBare: boolean; gapReplacement: string }
): Array<string> {
  return parts.map((part) => {
    switch (part.type) {
      case "bare-word": {
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
      case "curlies": {
        return "{" + part.content + "}";
      }
      case "square-brackets": {
        return "[" + part.content + "]";
      }
      default: {
        throw new Error(
          `unhandled ArgPart type in stringifyArgParts: ${(part as any).type}`
        );
      }
    }
  });
}
