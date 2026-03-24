import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import path from "path";
import { z } from "zod";
import fs from "fs";


export function createServer(filesDirectory: string, documentationUrl: string): McpServer {
    const server = new McpServer({ name: 'my-server', version: '1.0.0' });
    server.registerTool(
        'download-referenced-file',
        {
            title: 'Download referenced file and store it locally',
            description: 'Download a file from the documentation and store it locally',
            inputSchema: z.object({
                filename: z.string(),
            }),
            outputSchema: z.object({
                success: z.boolean(),
                message: z.string()
            })
        },
        async ({ filename }) => {
            const response = await fetch(`${documentationUrl}/${filename}`);
            const data = await response.text();
            fs.writeFileSync(path.join(filesDirectory, filename), data);
            return {
                content: [{ type: 'text', text: `File ${filename} downloaded successfully` }],
                structuredContent: {
                    success: true,
                    filename: filename
                }
            };
        }
    );

    return server;
}