import { Agent, Runtime, createOllamaLlm } from "@posiadly/multiagent";
import { requireEnv } from "../tools/EnvLoader.js";

async function main() {
  const llm = createOllamaLlm({
    baseUrl: requireEnv("OLLAMA_BASE_URL", "http://localhost:11434"),
    apiKey: requireEnv("OLLAMA_API_KEY", "ollama"),
    model: requireEnv("OLLAMA_MODEL", "llama3.2"),
  });

  const runtime = new Runtime(llm);
  const agent = new Agent(
    "test",
    "You are a helpful assistant. Reply briefly.",
  );

  await runtime.registerTree(agent);

  const reply = await runtime.chat("Say hello in one short sentence.");
  console.log(reply);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
