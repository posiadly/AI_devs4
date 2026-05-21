import { requireEnv } from "../tools/EnvLoader.js";
import { createClient } from "./client.js";

async function main() {

    const verificationUrl = requireEnv("VERIFICATION_URL");
    const apiKey = requireEnv("API_KEY");

    const client = await createClient(verificationUrl, apiKey);


}

main().catch(console.error);