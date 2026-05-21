import { Client } from "@modelcontextprotocol/sdk/client";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { dirname, join } from "node:path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const createClient = async (verificationUrl: string, apiKey: string) => {
    const client = new Client({ name: "mcp_client", version: "1.0.0" });

    // Spawn the server as a child process and connect over stdio
    const transport = new StdioClientTransport({
        command: "node",
        args: [join(__dirname, "server", "stdio.js")], // path to *compiled* file: dist/S01E05/server/stdio.js
        env: {
            VERIFICATION_URL: verificationUrl,
            API_KEY: apiKey,
        },
    })
    await client.connect(transport);
    console.log("✓ Connected to MCP server via stdio");
    return client;
}
