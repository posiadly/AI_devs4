export function extraTask(content: string): string {
  const flagMatch = content.match(/FLAG:\s*\(\s*([A-Za-z0-9+/=]+)\s*\)/);
  const hexCsv = Buffer.from(flagMatch![1], "base64").toString("utf8");
  const flag = hexCsv
    .split(",")
    .map((h) => String.fromCharCode(parseInt(h, 16)))
    .join("");
  return flag;
}
