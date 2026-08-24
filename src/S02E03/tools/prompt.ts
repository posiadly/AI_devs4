import path from "path";
import fs from "fs";

export function getPrompt(prompt: string): string {
  switch (prompt) {
    case "mainAgent":
      return fs.readFileSync(
        path.join(process.cwd(), "src", "S02E03", "prompts", "mainAgent.md"),
        "utf8",
      );
    case "searcher":
      return fs.readFileSync(
        path.join(process.cwd(), "src", "S02E03", "prompts", "searcher.md"),
        "utf8",
      );
    default:
      throw new Error(`Unknown prompt: ${prompt}`);
  }
}
