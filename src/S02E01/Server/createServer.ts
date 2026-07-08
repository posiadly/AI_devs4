import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Reporter } from "../../tools/Reporter.js";
import axios from "axios";
import { requireEnv } from "../../tools/EnvLoader.js";

export function createServer(
  url: string,
  apiKey: string,
  goodsUrl: string,
): McpServer {
  const server = new McpServer({ name: "my-server", version: "1.0.0" });
  server.registerTool(
    "get-material-list",
    {
      title: "Get the material list",
      description: "Get the material list",
      inputSchema: z.object({}),
      outputSchema: z.object({
        success: z.boolean(),
        result: z.string(),
      }),
    },
    async () => {
      const goods = await fetch(goodsUrl);
      const goodsCSVcontent = await goods.text();
      return {
        content: [{ type: "text", text: goodsCSVcontent }],
        structuredContent: {
          success: true,
          result: goodsCSVcontent,
        },
      };
    },
  );
  server.registerTool(
    "classify-material",
    {
      title: "Classify material into DNG or NEU",
      description: "Classify material into DNG or NEU",
      inputSchema: z.object({
        prompt: z.string(),
      }),
      outputSchema: z.object({
        success: z.boolean(),
        result: z.string(),
      }),
    },
    async ({ prompt }) => {
      try {
        const reporter = new Reporter(url, apiKey);
        const response = await reporter.sendAnswer("categorize", {
          prompt: prompt,
        });
        return {
          content: [{ type: "text", text: response.message }],
          structuredContent: {
            success: true,
            result: response.message,
          },
        };
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? JSON.stringify(error.response?.data ?? error.message)
          : error instanceof Error
            ? error.message
            : String(error);
        return {
          content: [{ type: "text", text: "Error: " + message }],
          structuredContent: {
            success: false,
            result: message,
          },
        };
      }
    },
  );
  server.registerTool(
    "reset",
    {
      title: "Reset the classification",
      description: "Reset the classification",
      inputSchema: z.object({}),
      outputSchema: z.object({
        success: z.boolean(),
        result: z.string(),
      }),
    },
    async () => {
      try {
        const reporter = new Reporter(url, apiKey);
        const response = await reporter.sendAnswer("categorize", {
          prompt: "reset",
        });
        return {
          content: [{ type: "text", text: response.message }],
          structuredContent: {
            success: true,
            result: response.message,
          },
        };
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? JSON.stringify(error.response?.data ?? error.message)
          : error instanceof Error
            ? error.message
            : String(error);
        return {
          content: [{ type: "text", text: "Error: " + message }],
          structuredContent: {
            success: false,
            result: message,
          },
        };
      }
    },
  );
  return server;
}
