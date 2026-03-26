import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import path from "path";
import { z } from "zod";
import fs from "fs";
import { OpenRouterService } from "../../tools/OpenRouterService.js";
import { PictureReader } from "./PictureReader.js";

export function createServer(filesDirectory: string, documentationUrl: string, openRouter: OpenRouterService): McpServer {
    const server = new McpServer({ name: 'my-server', version: '1.0.0' });
    server.registerTool(
        'download-referenced-file',
        {
            title: 'Download referenced file and store it locally',
            description: 'Download a file from the documentation and store it locally',
            inputSchema: z.object({
                fileName: z.string(),
            }),
            outputSchema: z.object({
                success: z.boolean(),
                fileName: z.string()
            })
        },
        async ({ fileName }) => {
            const response = await fetch(`${documentationUrl}/${fileName}`);
            const buffer = Buffer.from(await response.arrayBuffer());
            fs.writeFileSync(path.join(filesDirectory, fileName), buffer);
            return {
                content: [{ type: 'text', text: `File ${fileName} downloaded successfully` }],
                structuredContent: {
                    success: true,
                    fileName: fileName
                }
            };
        }
    );

    server.registerTool(
        'get-information-from-picture',
        {
            title: 'Get information from picture',
            description: 'It retrieves information from a picture file based on LLM prompt',
            inputSchema: z.object({
                pictureFileName: z.string(),
                mimeType: z.string(),
                prompt: z.string()
            }),
            outputSchema: z.object({
                information: z.string()
            })
        },
        async ({ pictureFileName, mimeType, prompt }) => {
            const picturePath = path.join(filesDirectory, pictureFileName);
            const picture = fs.readFileSync(picturePath);
            const pictureReader = new PictureReader(openRouter);
            const information = await pictureReader.readPicture(picture, mimeType, prompt);
            return {
                content: [{ type: 'text', text: `Content of the picture: ${pictureFileName} retrieved successfully.` }],
                structuredContent: { information: information }
            };
        }
    );
    server.registerTool(
        'read-text-file',
        {
            title: 'Read text file',
            description: 'Read a text file and return its content',
            inputSchema: z.object({
                fileName: z.string()
            }),
            outputSchema: z.object({
                content: z.string()
            })
        },
        async ({ fileName }) => {
            const content = fs.readFileSync(path.join(filesDirectory, fileName), 'utf8');
            return {
                content: [{ type: 'text', text: `File ${fileName} read successfully` }],
                structuredContent: { content: content }
            };
        }
    );
    return server;
}