import { requireEnv } from "../tools/EnvLoader.js";
import { readPictures } from "./tools/pictureReader.js";
import { cropPng, splitPngGrid } from "./tools/pngTools.js";
import { interpretPicture } from "./prompts/interpretPicture.js";
import fs from "fs";
import { OpenRouter } from "@openrouter/sdk";
import { buildMaze } from "./tools/mazeBuilder.js";
import { createTools } from "./tools/Tools.js";
import { createAgent } from "../S01E05/agent.js";
import { Agent } from "./tools/Agent.js";
import { agentPrompt } from "./prompts/agentPrompt.js";
import { TaskReporter } from "./tools/TaskReporter.js";
import { extractFlag } from "../tools/FlagExtractor.js";
import { extraTask } from "./tools/extraTast.js";

async function main() {
  const openRouterApiKey = requireEnv("OPENROUTER_API_KEY");
  const mapUrl = requireEnv("S02E02_MAP_URL");
  const verificationUrl = requireEnv("VERIFICATION_URL");
  const apiKey = requireEnv("API_KEY");

  const taskReporter = new TaskReporter(mapUrl, verificationUrl, apiKey);
  await taskReporter.reset();

  let map = await fetch(mapUrl);

  if (!map.ok) {
    throw new Error(`Failed to fetch map: ${map.status}`);
  }
  const openRouter = new OpenRouter({
    apiKey: openRouterApiKey,
  });
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
    openRouter,
    crossPattern,
    tiles,
    interpretPicture,
    "openai/gpt-5.5",
  );
  const maze = buildMaze(content.pictures);

  const tools = createTools(maze, taskReporter);
  const agent = new Agent(openRouter);

  const result = await agent.perform(agentPrompt, 50, "openai/gpt-5.5", tools);
  console.log(result);
  let flag = extractFlag(result);
  if (flag) {
    console.log("✅ Flag found:", flag);
  } else {
    console.log("🛑 Flag not found");
  }

  console.log("Extra task");

  map = await fetch(mapUrl);
  const mapText = await map.text();
  flag = extractFlag(extraTask(mapText));
  if (flag) {
    console.log("✅ Flag found:", flag);
  } else {
    console.log("🛑 Flag not found");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
