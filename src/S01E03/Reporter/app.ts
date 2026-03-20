import { Reporter } from "../../tools/Reporter.js";
import { requireEnv } from "../../tools/EnvLoader.js";
import { randomUUID } from "crypto";

async function main() {
    //I need parameter from cosole
    const urlToReport = process.argv[2];
    console.log("URL to report:", urlToReport);

    const verificationUrl = requireEnv("VERIFICATION_URL");
    const apiKey = requireEnv("API_KEY");
    const reporter = new Reporter(verificationUrl, apiKey);
    const answerRecord = { url: urlToReport, sessionID: randomUUID() };
    const answer = await reporter.sendAnswer("proxy", answerRecord);
    console.log(answer);
}




main().catch((error) => {
    if (error instanceof Error) {
        console.error("🛑 Error:", error.message);
    } else {
        console.error("🛑 Unknown error:", error);
    }
    process.exitCode = 1;
});
