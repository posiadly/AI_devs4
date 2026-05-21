
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { tools } from "./tools.js";
import { requireEnv } from "../../tools/EnvLoader.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";


const createServer = (apiUrl: string, apiKey: string) => {
    const server = new McpServer({ name: 'my-server', version: '1.0.0' });

    tools(apiUrl, apiKey).forEach(tool => {
        server.registerTool(tool.name, tool.config, tool.handler);
    });
    return server;
}

const main = async () => {
    const server = createServer(
        requireEnv("VERIFICATION_URL"),
        requireEnv("API_KEY"),
    );

    await server.connect(new StdioServerTransport());

    const exit = async () => { await server.close(); process.exit(0); }
    process.on("SIGINT", exit);
    process.on("SIGTERM", exit);
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});