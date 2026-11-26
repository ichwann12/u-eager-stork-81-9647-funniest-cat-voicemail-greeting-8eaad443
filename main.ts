// Funniest Cat Voicemail Greeting — make.fun entry.
// Reads the one-line greeting from line.txt, validates it against the
// bounty gate (a single line of 1-120 characters, not only whitespace),
// and writes it verbatim to entry.txt in the output directory.
//
// The grader runs this in a sandbox where the output directory is given
// by MAKEFUN_OUTPUT_DIR; MAKEFUN_BOT_DIR is only a fallback, and a local
// "output" folder is the last resort for local testing.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX_CHARS = 120;

function resolveOutputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim() !== "") {
    return fromEnv;
  }
  const botDir = process.env.MAKEFUN_BOT_DIR;
  if (botDir && botDir.trim() !== "") {
    return botDir;
  }
  return join(process.cwd(), "output");
}

function main(): void {
  const raw = readFileSync(join(process.cwd(), "line.txt"), "utf8");
  // Accept at most one trailing newline; any other newline means the
  // file is not a single line, and must fail loudly instead of being
  // silently trimmed down to one line.
  const withoutTrailingNewline = raw.endsWith("\n") ? raw.slice(0, -1) : raw;
  if (withoutTrailingNewline.includes("\n") || withoutTrailingNewline.includes("\r")) {
    throw new Error(
      "line.txt must contain exactly one line: found an embedded newline",
    );
  }
  const greeting = withoutTrailingNewline;
  // Control characters would break the spoken-aloud voicemail and the
  // gate's UTF-8 text check, so reject them outright.
  if (/[\u0000-\u001f\u007f]/.test(greeting)) {
    throw new Error("greeting must not contain control characters");
  }
  if (greeting.trim() === "") {
    throw new Error("greeting must not be only whitespace");
  }
  if (greeting.length < 1 || greeting.length > MAX_CHARS) {
    throw new Error(
      `greeting must be 1-${MAX_CHARS} characters, got ${greeting.length}`,
    );
  }
  const outDir = resolveOutputDir();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), greeting, "utf8");
  console.log(`wrote ${greeting.length} chars to ${join(outDir, "entry.txt")}`);
}

main();
