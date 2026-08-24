import { ToolDefinitionJson } from "@openrouter/sdk/models";
import fs from "fs";
import { OpenRouter } from "@openrouter/sdk";
import { getPrompt } from "./prompt.js";
import { Tool } from "../types.js";
import { Agent } from "./Agent.js";
import { createSearchTools } from "./searchTools.js";
import { Reporter } from "../../tools/Reporter.js";
import axios from "axios";
import { AIProxy } from "../../tools/AIProxy.js";
import { extractFlag } from "../../tools/FlagExtractor.js";
import { defineTool } from "./defineTool.js";

export function createMainAgentTools(
  url: string,
  apiKey: string,
  aiProxy: AIProxy,
  logLocation: string,
): Tool[] {
  return [
    defineTool({
      name: "search_lines",
      definition: {
        type: "function",
        function: {
          name: "search_lines",
          description:
            "Get lines from a log file that satisfies the condition. The condition may be a single value, several values, a regex-like pattern, or a short natural-language requirement. Don't call it with single condition, try to call it only once.",
          parameters: {
            type: "object",
            properties: {
              condition: {
                type: "string",
                description: "Condition to satisfy",
              },
            },
            required: ["condition"],
          },
        },
      },
      handler: async (args: { condition: string }) => {
        const agent = new Agent(aiProxy);
        const result = await agent.perform(
          getPrompt("searcher"),
          [`file: ${logLocation}`, `condition: ${args.condition}`],
          30,
          "google/gemini-2.5-flash",
          createSearchTools(),
        );
        return {
          content: [
            {
              type: "text",
              text: result,
            },
          ],
        };
      },
    }),
    defineTool({
      name: "submit_logs_to_headquarters",
      definition: {
        type: "function",
        function: {
          name: "submit_logs_to_headquarters",
          description: "Submit logs to headquarters",
          parameters: {
            type: "object",
            properties: {
              logs: { type: "string", description: "Logs to submit" },
            },
            required: ["logs"],
          },
        },
      },
      handler: async (args: { logs: string }) => {
        const reporter = new Reporter(url, apiKey);
        try {
          const result = await reporter.sendAnswer("failure", {
            logs: args.logs,
          });
          return {
            content: [{ type: "text", text: result }],
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(error.response!.data);
            return {
              content: [
                { type: "text", text: error.response!.data, error: true },
              ],
            };
          }
        }
      },
    }),
    defineTool({
      name: "report_flag",
      definition: {
        type: "function",
        function: {
          name: "report_flag",
          description: "Report the flag",
          parameters: {
            type: "object",
            properties: {
              flag: {
                type: "string",
                description: "Flag to report in format {FLG:XXXX}",
              },
            },
            required: ["flag"],
          },
        },
      },
      handler: async (args: { flag: string }) => {
        let flag = extractFlag(args.flag);
        if (flag) {
          console.log("✅ Flag found:", flag);
        } else {
          console.log("🛑 Flag not found");
        }
        return {
          content: [
            {
              type: "text",
              text: flag ? `✅ Flag found: ${flag}` : "🛑 Flag not found",
            },
          ],
        };
      },
      terminate: true,
    }),
  ];
}
