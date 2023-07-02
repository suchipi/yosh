import { parseInputString } from "./parse-input-string";
import { interpolateVars } from "./interpolate-vars";

const input = `hi there 'yeah' "yeah", 'yeah'"\\nyeah"'mhm' $HOME ye$\{SHELL\}s "something $SHELL" woo!\n`;
const output1 = parseInputString(input);
const output2 = interpolateVars(output1);

console.log(input, output1, output2);
