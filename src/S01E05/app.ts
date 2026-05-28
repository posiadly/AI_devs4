import { OpenRouter } from "@openrouter/sdk";
import { requireEnv } from "../tools/EnvLoader.js";
import { createClient } from "./client.js";
import { createAgent } from "./agent.js";
import { agentPrompt } from "./prompt.js";
import { extractFlag } from "../tools/FlagExtractor.js";
import { extraTask } from "./extraTask.js";

async function main() {

    const verificationUrl = requireEnv("VERIFICATION_URL");
    const apiKey = requireEnv("API_KEY");
    const openRouterApiKey = requireEnv("OPENROUTER_API_KEY");
    const openRouter = new OpenRouter({
        apiKey: openRouterApiKey,
    });

    const client = await createClient(verificationUrl, apiKey);
    const tools = await client.listTools();

    const agent = createAgent({
        openRouter: openRouter,
        mcpClient: client,
        instructions: agentPrompt,
        maxToolRounds: 20
    });
    const result = await agent.query("Aktywuj trasę kolejową o nazwie X-01.");
    let flag = extractFlag(result);
    if (flag) {
        console.log("✅ Flag found:", flag);
    } else {
        console.log("🛑 Flag not found");
    }

    console.log("Running extra task...");

    const extraTaskResult = await extraTask(verificationUrl, apiKey);
    flag = extractFlag(extraTaskResult);
    if (flag) {
        console.log("✅ Flag found:", flag);
    } else {
        console.log("🛑 Flag not found");
    }

}

main().catch(console.error);