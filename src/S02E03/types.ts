import { ToolDefinitionJson } from "@openrouter/sdk/models";

export type Tool = {
  name: string;
  definition: ToolDefinitionJson;
  handler: (args: any) => Promise<unknown>;
  terminate?: boolean;
};
