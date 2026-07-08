import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { requireEnv } from "../../tools/EnvLoader.js";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { toolsCondition } from "@langchain/langgraph/prebuilt";
import { ChatOpenRouter } from "@langchain/openrouter";
import { Client } from "@modelcontextprotocol/sdk/client";
import { MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import {
  SystemMessage,
  HumanMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { prompt } from "./prompt.js";
import { extractFlag } from "../../tools/FlagExtractor.js";

const MAX_TOOL_STEPS = 100;

async function main() {
  const openRouterApiKey = requireEnv("OPENROUTER_API_KEY");

  const client = new Client({ name: "mcp_client", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(
    new URL("http://localhost:3000/mcp"),
  );
  await client.connect(transport);

  const tools = await loadMcpTools("my-server", client);

  const llm = new ChatOpenRouter({
    apiKey: openRouterApiKey,
    model: "openai/gpt-5.5",
  }).bindTools(tools);

  async function agentNode(state: typeof MessagesAnnotation.State) {
    const response = await llm.invoke(state.messages);
    return { messages: [response] };
  }

  const agent = new StateGraph(MessagesAnnotation)
    .addNode("tools", new ToolNode(tools))
    .addNode("agent", agentNode)
    .addEdge(START, "agent")
    .addConditionalEdges("agent", toolsCondition)
    .addEdge("tools", "agent")
    .compile();

  let flag: string | undefined;

  for await (const chunk of await agent.stream(
    {
      messages: [
        new SystemMessage(prompt),
        new HumanMessage("classify materials"),
      ],
    },
    { recursionLimit: MAX_TOOL_STEPS, streamMode: "updates" },
  )) {
    console.log("Step:", chunk);
    if ("tools" in chunk && chunk.tools) {
      const messages = chunk.tools.messages;
      if (Array.isArray(messages)) {
        for (const msg of messages) {
          if (!(msg instanceof BaseMessage)) continue;
          const found = extractFlag(String(msg.content));
          if (found) flag = found;
        }
      }
    }
  }

  if (flag) {
    console.log("✅ Flag found:", flag);
  } else {
    console.log("🛑 Flag not found");
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
