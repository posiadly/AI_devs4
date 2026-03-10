import OpenAI from "openai";
import type { ChatCompletionContentPart, ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";
import { ResponseFormatJSONSchema } from "openai/resources/shared.mjs";


export class OpenAIService {
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey: apiKey });
    }

    public async parse<T>({ model = "gpt-4.1", systemPrompt, userPrompt, responseFormat }: { model?: string, systemPrompt: string, userPrompt?: string | undefined, responseFormat: ResponseFormatJSONSchema }) {
        const messages: ChatCompletionMessageParam[] = [{ role: "system", content: systemPrompt }];
        if (userPrompt) {
            messages.push({ role: "user", content: userPrompt });
        }

        const response = await this.client.chat.completions.parse({
            model, messages, response_format: responseFormat
        });
        if (response.choices[0].message.refusal) {
            throw new Error("Model refused to parse the response");
        }
        return response.choices[0].message.parsed! as T;
    }

    async query(
        systemMessage: string,
        userQuestion: string | ChatCompletionContentPart[],
        model = "gpt-4.1",
    ): Promise<string> {
        const openAIResponse = await this.client.chat.completions.create({
            model,
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userQuestion },
            ],
        });
        return openAIResponse?.choices?.[0]?.message?.content ?? "";
    }
}
