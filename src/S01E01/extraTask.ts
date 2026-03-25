import { OpenRouterService } from "../tools/OpenRouterService.js";
import { Person } from "../tools/PersonSource/types.js";
import { anomalyDetectorPrompt } from "./prompts/anomalyDetector.js";
import type { Message } from "@openrouter/sdk/models/message.js";

export async function extraTask(openRouter: OpenRouterService, records: Person[]) {
    const chunks = makeChunks(records, 500);

    const results = await Promise.all(chunks.map(
        chunk => openRouter.ask({
            model: "openai/gpt-4o-mini", messages: [
                { role: "system", content: anomalyDetectorPrompt } as Message,
                { role: "user", content: JSON.stringify(chunk) } as Message
            ]
        })));
    return results;
}

function makeChunks(records: Person[], chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < records.length; i += chunkSize) {
        chunks.push(records.slice(i, i + chunkSize));
    }
    return chunks;
}