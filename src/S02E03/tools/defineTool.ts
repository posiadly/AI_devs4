import { ToolDefinitionJson } from "@openrouter/sdk/models";
import { Tool } from "../types.js";

export function defineTool<TArgs, TResult>(tool: {
  name: string;
  definition: ToolDefinitionJson;
  handler: (args: TArgs) => Promise<TResult>;
  terminate?: boolean;
}): Tool {
  return tool;
}
