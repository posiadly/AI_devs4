import { requireEnv } from "../tools/EnvLoader.js";
import { readPictures } from "./tools/pictureReader.js";
import { cropPng, splitPngGrid } from "./tools/pngTools.js";
import { interpretPicture } from "./prompts/interpretPicture.js";
import fs from "fs";

async function main() {
  const apiKey = requireEnv("OPENROUTER_API_KEY");
  const mapUrl = requireEnv("S02E02_MAP_URL");
  const map = await fetch(mapUrl);
  if (!map.ok) {
    throw new Error(`Failed to fetch map: ${map.status}`);
  }

  const arrayBuffer = await map.arrayBuffer();
  const riddleBoxBuffer = await cropPng(arrayBuffer, {
    left: 238,
    top: 100,
    width: 282,
    height: 285,
  });
  fs.writeFileSync("riddleBox.png", Buffer.from(riddleBoxBuffer));

  const tiles = await splitPngGrid(riddleBoxBuffer, 3);
  const crossPattern = fs.readFileSync("src/S02E02/files/cross.png").buffer;

  const content = await readPictures(
    apiKey,
    crossPattern,
    tiles,
    interpretPicture,
    "openai/gpt-5",
  );
  console.log(JSON.stringify(content));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
