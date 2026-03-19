import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";


export function createServer(): McpServer {
    const server = new McpServer({ name: 'my-server', version: '1.0.0' });
    server.registerTool(
        'calculate-bmi',
        {
            title: 'BMI Calculator',
            description: 'Calculate Body Mass Index',
            inputSchema: z.object({
                weightKg: z.number(),
                heightM: z.number()
            }),
            outputSchema: z.object({ bmi: z.number() })
        },
        async ({ weightKg, heightM }) => {
            const output = { bmi: weightKg / (heightM * heightM) };
            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output
            };
        }
    );
    return server;
}