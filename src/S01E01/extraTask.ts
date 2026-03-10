import { OpenAIService } from "../tools/OpenAIService";
import { Person } from "./types";
import { anomalyDetectorPrompt } from "./prompts/anomalyDetector";

export async function extraTask(openai: OpenAIService, records: Person[]) {
    const chunks = makeChunks(records, 1000);

    const results = await Promise.all(chunks.map(
        chunk => openai.query(anomalyDetectorPrompt, JSON.stringify(chunk), "gpt-4o-mini")));
    return results;
}

function makeChunks(records: Person[], chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < records.length; i += chunkSize) {
        chunks.push(records.slice(i, i + chunkSize));
    }
    return chunks;
}