import { Message } from "@openrouter/sdk/esm/models/message";
import { OpenRouterService } from "../../tools/OpenRouterService";
import { agentPrompt } from "./prompts.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ToolDefinitionJson } from "@openrouter/sdk/esm/models/tooldefinitionjson";
import { ToolResponseMessage } from "@openrouter/sdk/esm/models";


export class Agent {
    private readonly maxSteps = 10;
    private conversation: Message[] = [];
    private openRouterTools: ToolDefinitionJson[] = [];
    constructor(private readonly openRouter: OpenRouterService, private mcpClient: Client) {
        this.conversation.push({ role: "system", content: agentPrompt() });
    }
    public async init() {
        const mcpTools = (await this.mcpClient.listTools()).tools;
        const openRouterTools = mcpTools.map((tool) => ({
            type: "function" as const,
            function: {
                name: tool.name,
                description: tool.description ?? "",
                parameters: tool.inputSchema
            }
        }));
        this.openRouterTools = openRouterTools;
    }

    public async message(message: string) {
        this.conversation.push({ role: "user", content: message });
        let stepsRemaining = this.maxSteps;

        while (stepsRemaining > 0) {
            stepsRemaining -= 1;

            const response = await this.openRouter.ask({
                model: "openai/gpt-4.1", messages: this.conversation,
                tools: this.openRouterTools

            });
            if (response.toolCalls) {
                //call tools parallel
                const results = await Promise.all(response.toolCalls.map(async tc => {
                    const result = await this.mcpClient.callTool({
                        name: tc.function.name,
                        arguments: tc.function.arguments ? JSON.parse(tc.function.arguments) : {}
                    });
                    return {
                        role: "tool",
                        content: result.content!,
                        toolCallId: tc.id,
                    } as ToolResponseMessage;
                }));

                this.conversation.push({
                    role: "assistant",
                    content: response.message!,
                    toolCalls: response.toolCalls,
                } as Message);

                this.conversation.push(...results);

            } else {
                this.conversation.push({
                    role: "assistant",
                    content: response.message!,
                } as Message);
                return response.message!;
            }

            console.log("Conversation:", this.conversation);

        }
    }
}