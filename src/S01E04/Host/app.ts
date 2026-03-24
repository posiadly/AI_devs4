import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { requireEnv } from "../../tools/EnvLoader.js";
import { OpenRouterService } from "../../tools/OpenRouterService.js";
import { Agent } from "./Agent.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function main() {

    const openRouterApiKey = requireEnv("OPENROUTER_API_KEY");
    const openRouter = new OpenRouterService(openRouterApiKey);
    const client = new Client({ name: "mcp_client", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(new URL("http://localhost:3000/mcp"));
    client.connect(transport);


    const documentationUrl = requireEnv("S01E04_DOCUMENTATION_URL");
    const mainFile = requireEnv("S01E04_MAIN_FILE");
    const documentation = await (await fetch(`${documentationUrl}/${mainFile}`)).text();
    const agent = new Agent(openRouter, client);
    await agent.init();

    const message = await agent.message(documentation);
    console.log(message);

}

main().catch((error) => {
    if (error instanceof Error) {
        console.error("🛑 Error:", error.message);
    } else {
        console.error("🛑 Unknown error:", error);
    }
    process.exitCode = 1;
});