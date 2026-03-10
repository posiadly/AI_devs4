import { OpenRouter } from "@openrouter/sdk";
import { Message } from "@openrouter/sdk/esm/models/message";
import { ResponseFormatJSONSchema } from "@openrouter/sdk/esm/models/responseformatjsonschema";


export class OpenRouterService {
    private client: OpenRouter;

    constructor(apiKey: string) {
        this.client = new OpenRouter({
            apiKey: apiKey,
        });
    }


    public async parse<T>({ model = "openai/gpt-4", systemPrompt, userPrompt, responseFormat }: { model?: string, systemPrompt: string, userPrompt?: string | undefined, responseFormat: ResponseFormatJSONSchema }) {
        const result = await this.client.chat.send({
            chatGenerationParams: {
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt ?? [] }
                ],
                responseFormat: responseFormat


            },
        });
        return JSON.parse(result.choices[0].message.content!) as T;
    }
    public async query({ model = "openai/gpt-4", systemPrompt, userPrompt }: { model?: string, systemPrompt: string, userPrompt: string }) {
        const result = await this.client.chat.send({
            chatGenerationParams: {
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ]
            }
        });
        return result.choices[0].message.content!;
    }


}
