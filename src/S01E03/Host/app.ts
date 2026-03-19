import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function main() {
    const client = new Client({ name: "mcp_client", version: "1.0.0" });

    const transport = new StreamableHTTPClientTransport(new URL("http://localhost:3000/mcp"));
    await client.connect(transport);
    console.log("Connected to the server");

    process.on("SIGINT", async () => {
        await transport.close();
        process.exit(0);
    });

    // Keep the process alive so you can observe/extend interaction.
    process.stdin.resume();
}

main().catch(console.error);