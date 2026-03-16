import { requireEnv } from "../tools/EnvLoader.js";
import { OpenRouterService } from "../tools/OpenRouterService.js";
import { PersonSource } from "../tools/PersonSource/PersonSource.js";
import type { Message } from "@openrouter/sdk/esm/models/message";
import { prepareHandlers } from "./handlers.js";
import { agentPrompt } from "./prompts/agent.js";
import { allTools } from "./schemas/handlers.js";
import { ToolCaller } from "./tools/ToolCaller.js";
import { pesonClosestToPowerPlantOutputSchema } from "./schemas/outputs.js";
import { AgentResult } from "./types.js";
import { extractFlag } from "../tools/FlagExtractor.js";
import { buildAnswerRecords } from "./tools/utils.js";
import { Reporter } from "../tools/Reporter.js";
import { extraTask } from "./extraTask.js";

const MAX_TOOL_STEPS = 20;

async function main() {

    let stepsRemaining = MAX_TOOL_STEPS;
    const openRouterApiKey = requireEnv("OPENROUTER_API_KEY");
    const peopleUrl = requireEnv("S01E01_PEOPLE_URL");
    const findHimLocationsUrl = requireEnv("S01E02_FINDHIM_LOCATIONS_URL");
    const locationUrl = requireEnv("S01E02_LOCATION_URL");
    const accessLevelUrl = requireEnv("S01E02_ACCESS_LEVEL_URL");
    const apiKey = requireEnv("API_KEY");
    const verificationUrl = requireEnv("VERIFICATION_URL");

    const openRouter = new OpenRouterService(openRouterApiKey);
    const reporter = new Reporter(verificationUrl, apiKey);

    const personSource = new PersonSource(openRouter);
    await personSource.load(peopleUrl);


    const handlers = prepareHandlers(apiKey, openRouter, findHimLocationsUrl, locationUrl, accessLevelUrl, personSource);
    const toolCaller = new ToolCaller(handlers);


    //const result = await handlers["get_access_level"]({ name: "Wojciech", surname: "Bielik", birthYear: 1986 });
    const conversation: Message[] = [
        { role: "user", content: agentPrompt() } as Message,
    ];

    let agentResult: AgentResult;

    while (stepsRemaining > 0) {
        stepsRemaining -= 1;
        //put here all tools from schemas/handlers.js
        const response = await openRouter.ask({
            model: "openai/gpt-4.1", messages: conversation,
            tools: allTools,
            responseFormat: pesonClosestToPowerPlantOutputSchema

        });
        if (response.toolCalls) {
            console.log("🔍 Tool calls:", response.toolCalls);
            const results = await Promise.all(response.toolCalls.map(toolCall => toolCaller.callTool(toolCall)));
            conversation.push({
                role: "assistant",
                content: response.message!,
                toolCalls: response.toolCalls,
            } as Message);
            conversation.push(...results);
            console.log("🔍 Tools results:", JSON.stringify(results));
        } else {
            agentResult = JSON.parse(response.message!) as AgentResult;
            break;
        }
    }



    const answerRecords = buildAnswerRecords(agentResult!);
    const verificationResult = await reporter.sendAnswer("findhim", answerRecords);

    let flag = extractFlag(verificationResult.message);

    if (flag) {
        console.log("✅ Flag found:", flag);
    } else {
        console.log("🛑 Flag not found");
    }

    console.log("Running extra task...");
    const extraTaskResult = await extraTask(handlers["get_access_level"]);
    flag = extractFlag(extraTaskResult);
    if (flag) {
        console.log("✅ Flag found:", flag);
    } else {
        console.log("🛑 Flag not found");
    }


}

main().catch((error) => {
    if (error instanceof Error) {
        console.error("🛑 Error:", error.message);
    } else {
        console.error("🛑 Unknown error:", error);
    }
    process.exitCode = 1;
});

