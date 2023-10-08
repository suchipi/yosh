const RESET = reset("");

export function defaultPrompt() {
  const username = $("whoami").stdout.trim();
  const hostname = $("hostname").stdout.trim();

  let dir = pwd().toString();
  if (env.HOME) {
    dir = dir.replace(new RegExp("^" + RegExp.escape(env.HOME)), "~");
  }

  return `${green(username)}${RESET}@${hostname}${RESET} ${cyan(
    dir
  )}${RESET} \$ `;
}
