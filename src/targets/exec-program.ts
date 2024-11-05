import { parseInputString } from "../parse-input-string";
import { stringifyArgParts } from "../stringify-arg-parts";

export function execProgram(input: string) {
  const argParts = parseInputString(input);
  const execArgs = stringifyArgParts(
    argParts.filter((part) => part.type !== "gap"),
    {
      quoteBare: false,
      gapReplacement: "",
    }
  );

  console.log(
    dim(`-> exec(${JSON.stringify(execArgs)}, { failOnNonZeroStatus: false });`)
  );
  return exec(execArgs, { failOnNonZeroStatus: false });
}
