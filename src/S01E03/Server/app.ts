
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "crypto";
import express from "express";
import { createServer } from "./createServer.js";



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
        // Check for existing session ID
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        let transport: StreamableHTTPServerTransport;

        if (sessionId && transports.has(sessionId)) {
            // Reuse existing transport
            transport = transports.get(sessionId)!;
        } else if (!sessionId) {
            const server = createServer();

            // New initialization request
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                onsessioninitialized: (sessionId: string) => {
                    // Store the transport by session ID when a session is initialized
                    // This avoids race conditions where requests might come in before the session is stored
                    console.log(`Session initialized with ID: ${sessionId}`);
                    transports.set(sessionId, transport);
                },
                enableJsonResponse: true
            });

            // Set up onclose handler to clean up transport when closed
            server.server.onclose = async () => {
                const sid = transport.sessionId;
                if (sid && transports.has(sid)) {
                    console.log(
                        `Transport closed for session ${sid}, removing from transports map`
                    );
                    transports.delete(sid);
                }
            };

            // Connect the transport to the MCP server BEFORE handling the request
            // so responses can flow back through the same transport
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
            return;
        } else {
            // Invalid request - no session ID or not initialization request
            res.status(400).json({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Bad Request: No valid session ID provided",
                },
                id: req?.body?.id,
            });
            return;
        }

        // Handle the request with existing transport - no need to reconnect
        // The existing transport is already connected to the server
        await transport.handleRequest(req, res, req.body);


    } catch (error) {
        console.log("Error handling MCP request:", error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32603,
                    message: "Internal server error",
                },
                id: req?.body?.id,
            });
            return;
        }
    }
});
app.listen(3000, () => {
    console.log("MCP Streamable HTTP Server running at http://localhost:3000/mcp");
});