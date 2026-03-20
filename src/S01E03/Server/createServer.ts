import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";


export function createServer(apikey: string, packageApiUrl: string): McpServer {
    const server = new McpServer({ name: 'my-server', version: '1.0.0' });
    server.registerTool(
        'check-package-status',
        {
            title: 'Check Package Status',
            description: 'Check the status of a package',
            inputSchema: z.object({
                packageid: z.string()
            }),
            outputSchema: z.object({
                packageid: z.string(),
                status: z.string(),
                additionalInfo: z.string()
            })
        },
        async ({ packageid }) => {
            const response = await fetch(packageApiUrl);
            const data = await response.json();
            let output: any;
            if (data.ok) {
                output = {
                    packageid: packageid,
                    status: data.status,
                    additionalInfo: data.message
                };
            } else {
                output = {
                    packageid: packageid,
                    status: "unknown",
                    additionalInfo: "No tracking data available for this package."
                };
            }
            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output
            };
        }
    );

    server.registerTool(
        'redirect-pacage',
        {
            title: 'Redirect Package',
            description: 'Redirect a package to a new destination',
            inputSchema: z.object({
                packageid: z.string(),
                destination: z.string(),
                code: z.string()
            }),
            outputSchema: z.object({
                confirmation: z.string().optional(),
                message: z.string().optional()
            })
        },
        async ({ packageid, destination, code }) => {
            const response = await fetch(packageApiUrl, {
                method: 'POST',
                body: JSON.stringify({
                    apikey: apikey,
                    action: "redirect",
                    packageid: packageid,
                    destination: destination,
                    code: code
                })
            });
            console.log(response);
            const data = await response.json();
            const output = {
                confirmation: data.confirmation ?? undefined,
                message: data.message ?? undefined
            };
            return {
                content: [{ type: 'text', text: JSON.stringify(output) }],
                structuredContent: output
            };
        }
    );

    return server;
}