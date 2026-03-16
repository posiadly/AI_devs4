import { OpenRouter } from "@openrouter/sdk";
import { ChatMessageToolCall, OpenResponsesFunctionToolCall } from "@openrouter/sdk/esm/models";
import type { Message } from "@openrouter/sdk/esm/models/message";
import type { ResponseFormatJSONSchema } from "@openrouter/sdk/esm/models/responseformatjsonschema";
import type { ToolDefinitionJson } from "@openrouter/sdk/esm/models/tooldefinitionjson";


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

    public async ask({ model = "openai/gpt-4", messages, tools, responseFormat   }: { model?: string, messages: Message[], tools?: ToolDefinitionJson[], responseFormat?: ResponseFormatJSONSchema }): Promise<{ toolCalls?: ChatMessageToolCall[], message?: string }> {
        const result = await this.client.chat.send({
            chatGenerationParams: {
                model: model,
                messages: messages,
                tools: tools ?? [],
                toolChoice: "auto",
                responseFormat: responseFormat
            }
        });
        return {
            toolCalls: result.choices[0].message.toolCalls,
            message: result.choices[0].message.content,
        }
    }
}
