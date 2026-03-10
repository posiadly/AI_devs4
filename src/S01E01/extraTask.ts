import { OpenRouterService } from "../tools/OpenRouterService";
import { Person } from "./types";
import { anomalyDetectorPrompt } from "./prompts/anomalyDetector";

export async function extraTask(openRouter: OpenRouterService, records: Person[]) {
    const chunks = makeChunks(records, 500);

    const results = await Promise.all(chunks.map(
        chunk => openRouter.query({ model: "openai/gpt-4o-mini", systemPrompt: anomalyDetectorPrompt, userPrompt: JSON.stringify(chunk) })));
    return results;
}

function makeChunks(records: Person[], chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < records.length; i += chunkSize) {
        chunks.push(records.slice(i, i + chunkSize));
    }
    return chunks;
}