import { ToolDefinitionJson } from "@openrouter/sdk/models";
import fs from "fs";
import { OpenRouter } from "@openrouter/sdk";
import { getPrompt } from "./prompt.js";
import { Tool } from "../types.js";
import { defineTool } from "./defineTool.js";

export function createSearchTools(): Tool[] {
  return [
    defineTool({
      name: "search_lines",
      definition: {
        type: "function",
        function: {
          name: "search_lines",
          description:
            "Search lines in a file using Regular expression. Use 'foo|bar' for OR search",
          parameters: {
            type: "object",
            properties: {
              file_path: { type: "string", description: "Path to the file" },
              regex: {
                type: "string",
                description: "Regular expression to search for",
              },
            },
            required: ["file_path", "regex"],
          },
        },
      },
      handler: async (args: { file_path: string; regex: string }) => {
        const content = await fs.promises.readFile(args.file_path, "utf8");
        try {
          const regex = new RegExp(args.regex);
          const matchingLines = content
            .split(/\r?\n/)
            .filter((line) => regex.test(line));
          return {
            content: [
              {
                type: "text",
                text:
                  matchingLines.length > 0
                    ? matchingLines.join("\n")
                    : "No matches found",
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              { type: "text", text: (error as Error).message, error: true },
            ],
          };
        }
      },
      terminate: true,
    }),
  ];
}
