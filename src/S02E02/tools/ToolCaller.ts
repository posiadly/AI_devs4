import { ChatMessageToolCall, ToolResponseMessage } from "@openrouter/sdk/models";

export class ToolCaller {
    constructor(private toolHandlers: any) {
    }
    public async callTool(toolCall: ChatMessageToolCall): Promise<ToolResponseMessage> {
        return {
            role: "tool",
            content: JSON.stringify(await this.toolHandlers[toolCall.function.name](JSON.parse(toolCall.function.arguments))),
            toolCallId: toolCall.id,
        } as ToolResponseMessage;
    }
}