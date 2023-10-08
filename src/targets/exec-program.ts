import { parseInputString } from "../parse-input-string";

export function execProgram(input: string) {
  const execArgs = parseInputString(input)
    .filter((part) => part.type !== "gap")
    .map((part) => (part as any).content);

  console.log(dim("-> exec program: " + JSON.stringify(execArgs)));
  return exec(execArgs, { failOnNonZeroStatus: false });
}
