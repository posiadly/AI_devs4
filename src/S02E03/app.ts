import { OpenRouter } from "@openrouter/sdk";
import { requireEnv } from "../tools/EnvLoader.js";
import { downloadLog } from "./tools/log.js";
import { Agent } from "./tools/Agent.js";
import { getPrompt } from "./tools/prompt.js";
import { createMainAgentTools } from "./tools/mainAgentTools.js";
import { AIProxy } from "../tools/AIProxy.js";
import { extraTask } from "./tools/extraTask.js";
import { extractFlag } from "../tools/FlagExtractor.js";

async function main() {
  const verificationUrl = requireEnv("VERIFICATION_URL");
  const apiKey = requireEnv("API_KEY");
  const failureLogUrl = requireEnv("S02E03_FAILURE_LOG_URL");
  const logLocation = requireEnv("S02E03_LOG_LOCATION");
  const openRouterApiKey = requireEnv("OPENROUTER_API_KEY");
  const useAICore = requireEnv("USE_AICORE");
  await downloadLog(failureLogUrl, logLocation);
  const openRouter = new OpenRouter({
    apiKey: openRouterApiKey,
  });
  const aiProxy = new AIProxy(openRouter, useAICore === "true");
  const agent = new Agent(aiProxy);
  let result = await agent.perform(
    getPrompt("mainAgent"),
    [],
    30,
    "openai/gpt-5.5",
    createMainAgentTools(verificationUrl, apiKey, aiProxy, logLocation),
  );
  console.log(result);

  console.log("Extra task");
  result = await extraTask(verificationUrl, apiKey);
  const flag = extractFlag(result);
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
