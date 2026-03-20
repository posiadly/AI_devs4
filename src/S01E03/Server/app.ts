
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";
import express from "express";
import { createServer } from "./createServer.js";
import { requireEnv } from "../../tools/EnvLoader.js";


const packageApiUrl = requireEnv("S01E03_PACKAGE_API_URL");
const apikey = requireEnv("API_KEY");

const app = express();
app.use(express.json());

//https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md
//testing npx @modelcontextprotocol/inspector 
// https://modelcontextprotocol.io/examples



// Map sessionId to server transport for each client
const transports: Map<string, StreamableHTTPServerTransport> = new Map<
    string,
    StreamableHTTPServerTransport
>();


app.post("/mcp", async (req, res) => {
    console.log("Received MCP POST request");
    try {
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        let transport: StreamableHTTPServerTransport;

        if (sessionId && transports.has(sessionId)) {
            transport = transports.get(sessionId)!;
        } else if (!sessionId) {
            const server = createServer(apikey, packageApiUrl);
            const sessionId = randomUUID();

            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => sessionId,
                enableJsonResponse: true
            });

            transports.set(sessionId, transport);

            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
        } else {
            res.status(400).json({ error: `Session ${sessionId} not found` });
            return;
        }

        await transport!.handleRequest(req, res, req.body);
    } catch (error) {
        res.status(500).json({ error: `Internal server error: ${error}` });
    }
});
app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (sessionId && transports.has(sessionId)) {
        transports.delete(sessionId);
    }
    res.status(200).json({ message: "Session deleted" });
});
app.listen(3000, () => {
    console.log("MCP Streamable HTTP Server running at http://localhost:3000/mcp");
});