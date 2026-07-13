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
import { prompt, promptExtra } from "./prompt.js";
import { extractFlag } from "../../tools/FlagExtractor.js";
import { task } from "./task.js";

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

  let flag = await task(agent, prompt, MAX_TOOL_STEPS);
  if (flag) {
    console.log("✅ Flag found:", flag);
  } else {
    console.log("🛑 Flag not found");
  }
  console.log("Extra task will be executed here...");
  flag = await task(agent, promptExtra, MAX_TOOL_STEPS);
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
