import { OpenRouter } from "@openrouter/sdk";
import {
  AssistantMessage,
  ChatGenerationParams,
  ChatMessageToolCall,
} from "@openrouter/sdk/models";
import {
  ChatCompletionRequest,
  ChatCompletionTool,
  ChatMessage,
  ChatMessageContent,
  OrchestrationClient,
  AssistantChatMessage,
  UserChatMessageContent,
} from "@sap-ai-sdk/orchestration";
import xsenv from "@sap/xsenv";

export type ProxyChatRequest = {
  chatGenerationParams: Pick<
    ChatGenerationParams,
    "model" | "messages" | "tools"
  >;
};

export type ProxyChatResponse = Pick<AssistantMessage, "toolCalls" | "content">;

export class AIProxy {
  public constructor(
    private readonly openRouter: OpenRouter,
    private readonly useAICore: boolean = false,
  ) {
    if (this.useAICore) {
      xsenv.loadEnv();
    }
  }
  public async send(request: ProxyChatRequest): Promise<ProxyChatResponse> {
    if (this.useAICore) {
      const model = request.chatGenerationParams.model;
      if (!model) {
        throw new Error("Model is required when using AI Core.");
      }
      const orchestrationClient = new OrchestrationClient({
        promptTemplating: {
          model: {
            name: this.aiCoreModel(model),
          },
          prompt: {
            tools: this.aiCoreTools(request.chatGenerationParams.tools),
          },
        },
      });
      const aiCoreRequest: ChatCompletionRequest = {
        messages: this.mapMessagesToAiCore(
          request.chatGenerationParams.messages,
        ),
      };
      const aiCoreResult =
        await orchestrationClient.chatCompletion(aiCoreRequest);
      return {
        toolCalls: this.aiCoreToolCall(aiCoreResult.getToolCalls()),
        content: aiCoreResult.getContent(),
      };
    } else {
      const openRouterResult = await this.openRouter.chat.send({
        ...request,
        chatGenerationParams: {
          ...request.chatGenerationParams,
          stream: false,
        },
      });
      return {
        toolCalls: openRouterResult.choices[0].message.toolCalls,
        content: openRouterResult.choices[0].message.content,
      };
    }
  }
  private aiCoreModel(model: string): string {
    return model.split("/")[1];
  }
  private aiCoreTools(
    tools: ChatGenerationParams["tools"],
  ): ChatCompletionTool[] {
    return (
      tools?.map((tool) => ({
        type: tool.type,
        function: tool.function,
      })) ?? ([] as ChatCompletionTool[])
    );
  }
  private aiCoreToolCall(
    toolCalls: AssistantChatMessage["tool_calls"],
  ): ChatMessageToolCall[] | undefined {
    if (!toolCalls?.length) {
      return undefined;
    }
    return toolCalls.map((tc) => ({
      type: tc.type,
      id: tc.id,
      function: tc.function,
    }));
  }
  private mapMessagesToAiCore(
    messages: ChatGenerationParams["messages"],
  ): ChatCompletionRequest["messages"] {
    return (
      messages?.map((message): ChatMessage => {
        switch (message.role) {
          case "system":
            return {
              role: "system",
              content: message.content as ChatMessageContent,
            };
          case "user":
            return {
              role: "user",
              content: message.content as UserChatMessageContent,
            };
          case "assistant":
            return {
              role: "assistant",
              content: message.content
                ? (message.content as ChatMessageContent)
                : undefined,
              tool_calls: message.toolCalls?.map((tc) => ({
                type: tc.type,
                id: tc.id,
                function: tc.function,
              })),
            };
          case "tool":
            return {
              role: "tool",
              content: message.content as ChatMessageContent,
              tool_call_id: message.toolCallId,
            };
          case "developer":
            return {
              role: "developer",
              content: message.content as ChatMessageContent,
            };
        }
      }) ?? []
    );
  }
}
