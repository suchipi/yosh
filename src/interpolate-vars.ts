export function interpolateVars(inputString: string) {
  return inputString.replace(/\$\{?([A-Za-z_]\w*)\}?/g, (match, varName) => {
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
  });
}
