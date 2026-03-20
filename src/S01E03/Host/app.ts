import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import express from "express";
import { ChatRequest, ChatResponse } from "../types";
import { Agent } from "./Agent.js";
import { OpenRouterService } from "../../tools/OpenRouterService.js";
import { requireEnv } from "../../tools/EnvLoader";


const openRouterApiKey = requireEnv("OPENROUTER_API_KEY");
const client = new Client({ name: "mcp_client", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(new URL("http://localhost:3000/mcp"));
const agents = new Map<string, Agent>();
const openRouter = new OpenRouterService(openRouterApiKey);

const app = express();
app.use(express.json());
app.post("/chat", async (req, res) => {
    const chatRequest = req.body as ChatRequest;
    const match = String(req.body.msg).match(/\{FLG:([^}]+)\}/);
    if (match) {
        const flag = match[0];   // e.g. "{FLG:FABRICATOR}"
        console.log("Flag:", flag);
    }

    let agent: Agent;
    if (agents.has(chatRequest.sessionID)) {
        agent = agents.get(chatRequest.sessionID)!;
    } else {
        agent = new Agent(chatRequest.sessionID, openRouter, client);
        agents.set(chatRequest.sessionID, agent);
        await agent.init();
    }
    const message = await agent.message(chatRequest.msg);

    const chatResponse: ChatResponse = { msg: message! };
    res.json(chatResponse);
});

async function init(): Promise<void> {
    await client.connect(transport);
}

init();
app.listen(3001, () => {
    console.log("MCP Client running at http://localhost:3001/chat");
});




