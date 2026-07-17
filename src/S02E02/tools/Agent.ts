import { Message } from "@openrouter/sdk/models/message";
import { OpenRouter } from "@openrouter/sdk";
import { Tool } from "./Tools.js";
import { ToolCaller } from "./ToolCaller.js";
import { extractFlag } from "../../tools/FlagExtractor.js";

export class Agent {
  constructor(private readonly openRouter: OpenRouter) {}

  public async perform(
    agentPrompt: string,
    maxSteps: number = 30,
    model: string = "openai/gpt-5",
    tools: Tool[],
  ) {
    const toolCaller = new ToolCaller(
      Object.fromEntries(tools.map((t) => [t.name, t.handler])),
    );
    const conversation: Message[] = [{ role: "system", content: agentPrompt }];
    let stepsRemaining = maxSteps;
    const toolDefinitions = tools.map((tool) => tool.definition);

    while (stepsRemaining > 0) {
      stepsRemaining -= 1;
      const response = await this.openRouter.chat.send({
        chatGenerationParams: {
          model: model,
          messages: conversation,
          tools: toolDefinitions,
        },
      });
      if (response.choices[0].message.toolCalls) {
        const results = await Promise.all(
          response.choices[0].message.toolCalls.map(async (tc) => {
            return await toolCaller.callTool(tc);
          }),
        );

        const flag = results
          .map((r) => extractFlag(String(r.content ?? "")))
          .find((f) => f !== undefined);
        if (flag) {
          return `{FLG:${flag}}`;
        }

        conversation.push({
          role: "assistant",
          content: response.choices[0].message.content!,
          toolCalls: response.choices[0].message.toolCalls,
        } as Message);

        conversation.push(...results);
      } else {
        conversation.push({
          role: "assistant",
          content: response.choices[0].message.content!,
        } as Message);
        return response.choices[0].message.content!;
      }
    }
  }
}
