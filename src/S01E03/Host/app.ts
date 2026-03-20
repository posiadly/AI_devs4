import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import express from "express";
import { ChatRequest, ChatResponse } from "../types";

const client = new Client({ name: "mcp_client", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(new URL("http://localhost:3000/mcp"));


const app = express();
app.use(express.json());
app.post("/chat", async (req, res) => {
    const chatRequest = req.body as ChatRequest;
    const chatResponse: ChatResponse = { msg: "dupka" };
    res.json(chatResponse);
});

async function init(): Promise<void> {
    await client.connect(transport);
}

init();
app.listen(3001, () => {
    console.log("MCP Client running at http://localhost:3001/chat");
});




