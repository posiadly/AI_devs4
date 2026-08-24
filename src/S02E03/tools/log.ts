import fs from "fs";
import path from "path";

export async function downloadLog(logUrl: string, into: string) {
  const log = await fetch(logUrl);
  const logText = await log.text();
  fs.mkdirSync(path.dirname(into), { recursive: true });
  fs.writeFileSync(into, logText);
}
