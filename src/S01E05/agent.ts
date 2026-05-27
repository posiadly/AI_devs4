import { Message } from "@openrouter/sdk/models/message";
import { OpenRouter } from "@openrouter/sdk";
import { ToolDefinitionJson } from "@openrouter/sdk/models/tooldefinitionjson";
import { ChatResponse, ToolResponseMessage } from "@openrouter/sdk/models";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

export const createAgent = ({ openRouter, mcpClient, model = "openai/gpt-5", instructions, maxToolRounds }: { openRouter: OpenRouter, mcpClient: Client, model?: string, instructions: string, tools?: ToolDefinitionJson[], maxToolRounds: number }) => ({
    async query(message: string): Promise<string> {
        const conversation: Message[] = [{ role: "system", content: instructions }, { role: "user", content: message }];
        const tools = await mcpClient.listTools();
        let flag: string | undefined = undefined;


        for (let round = 0; round < maxToolRounds; round++) {

            const response = await openRouter.chat.send({
                chatGenerationParams: {
                    model: model,
                    messages: conversation,
                    tools: tools.tools.map(tool => ({
                        type: "function" as const,
                        function: {
                            name: tool.name,
                            description: tool.description ?? "",
                            parameters: tool.inputSchema
                        }
                    })),
                    toolChoice: "auto",
                }
            });


            const toolCalls = response.choices[0].message.toolCalls ?? [];

            if (toolCalls.length === 0) {
                return response.choices[0].message.content!;
            }

            const toolCallResult = await Promise.all(toolCalls.map(async tc => {
                console.log('Tool call:', JSON.stringify(tc));
                const result = await mcpClient.callTool({
                    name: tc.function.name,
                    arguments: tc.function.arguments ? JSON.parse(tc.function.arguments) : {}
                });
                console.log('Tool result:', JSON.stringify(result));
                if (result.structuredContent) {
                    const match = (result.structuredContent as any).result?.message?.match(/{FLG:[^}]+}/);
                    if (match) {
                        flag = match[0];
                    }
                }
                return {
                    role: "tool",
                    content: result.structuredContent ? JSON.stringify(result.structuredContent) : result.content,
                    toolCallId: tc.id,
                } as ToolResponseMessage;
            }));

            if (flag) {
                return flag;
            }

            conversation.push(response.choices[0].message);
            conversation.push(...toolCallResult);
        }
        throw new Error('Max tool rounds reached');
    }
});

const extractToolCalls = (response: ChatResponse) => {
    return response.choices[0].message.toolCalls ?? [];
}



