import {
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { extractFlag } from "../../tools/FlagExtractor.js";
import {
  CompiledStateGraph,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";

export async function task(
  agent: CompiledStateGraph<
    typeof MessagesAnnotation.State,
    typeof MessagesAnnotation.Update,
    "__start__" | "agent" | "tools"
  >,
  prompt: string,
  maxToolSteps: number,
) {
  let flag: string | undefined;

  for await (const chunk of await agent.stream(
    {
      messages: [
        new SystemMessage(prompt),
        new HumanMessage("classify materials"),
      ],
    },
    { recursionLimit: maxToolSteps, streamMode: "updates" },
  )) {
    console.log("Step:", chunk);
    if ("tools" in chunk && chunk.tools) {
      const messages = chunk.tools?.messages;
      if (Array.isArray(messages)) {
        for (const msg of messages) {
          if (!(msg instanceof BaseMessage)) continue;
          const found = extractFlag(String(msg.content));
          if (found) return found;
        }
      }
    }
  }
}
