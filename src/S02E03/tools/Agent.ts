import { Message } from "@openrouter/sdk/models/message";
import { OpenRouter } from "@openrouter/sdk";
import { Tool } from "../types.js";
import { ToolCaller } from "./ToolCaller.js";
import { AIProxy } from "../../tools/AIProxy.js";
import { ToolResponseMessage } from "@openrouter/sdk/models";

export class Agent {
  constructor(private readonly aiProxy: AIProxy) {}

  public async perform(
    agentPrompt: string,
    userMessages: string[] = [],
    maxSteps: number = 30,
    model: string = "openai/gpt-5",
    tools: Tool[],
  ) {
    const toolCaller = new ToolCaller(
      Object.fromEntries(tools.map((t) => [t.name, t.handler])),
    );
    const conversation: Message[] = [
      { role: "system", content: agentPrompt },
      ...userMessages.map((m) => ({ role: "user", content: m }) as Message),
    ];
    let stepsRemaining = maxSteps;
    let terminationMessage: ToolResponseMessage | undefined;
    const toolDefinitions = tools.map((tool) => tool.definition);

    while (stepsRemaining > 0 && !terminationMessage) {
      stepsRemaining -= 1;
      const response = await this.aiProxy.send({
        chatGenerationParams: {
          model,
          messages: conversation,
          tools: toolDefinitions,
        },
      });
      if (response.toolCalls) {
        const results = await Promise.all(
          response.toolCalls.map(async (tc) => {
            const result = await toolCaller.callTool(tc);
            if (tools.find((t) => t.name === tc.function.name)?.terminate) {
              terminationMessage = result;
            }
            return result;
          }),
        );

        conversation.push({
          role: "assistant",
          content: response.content!,
          toolCalls: response.toolCalls,
        } as Message);

        conversation.push(...results);
      } else {
        conversation.push({
          role: "assistant",
          content: response.content!,
        } as Message);
        return response.content!;
      }
    }
    if (stepsRemaining <= 0) {
      return {
        content: [{ type: "text", text: "Max steps reached", error: true }],
      };
    }
    return terminationMessage!;
  }
}
