import type { ArgPart } from "./parse-input-string";

export function interpolateVars(args: Array<ArgPart>) {
  return args.map((arg) => {
    if (arg.type === "gap") return arg;

    if (arg.type !== "single-quoted" && arg.type !== "backticks") {
      const contentWithEnv = arg.content.replace(
        /\$\{?([A-Za-z_]\w*)\}?/g,
        (match, varName) => {
          if (varName.toUpperCase() === varName) {
            const replacement = env[varName];
            if (replacement == null) {
              throw new Error(
                `Requested envrionment variable wasn't defined: ${varName}`
              );
            }
            return replacement;
          } else {
            if (!Object.hasOwn(globalThis, varName)) {
              throw new Error(
                `Requested global JS variable wasn't defined: ${varName}`
              );
            }

            return String(globalThis[varName]);
          }
        }
      );
      return {
        type: arg.type,
        content: contentWithEnv,
      };
    }
  });
}
