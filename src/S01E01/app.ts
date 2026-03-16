import axios from "axios";

import { buildAnswerRecords, } from "./utils/utils.js";
import { OpenRouterService } from "../tools/OpenRouterService.js";
import { Reporter } from "../tools/Reporter.js";
import { extractFlag } from "../tools/FlagExtractor.js";
import { requireEnv } from "../tools/EnvLoader.js";
import fs from "fs";
import { extraTask } from "./extraTask.js";
import { PersonSource } from "../tools/PersonSource/PersonSource.js";

async function main() {
    const url = requireEnv("S01E01_PEOPLE_URL");
    const verificationUrl = requireEnv("VERIFICATION_URL");
    const apiKey = requireEnv("API_KEY");

    const openRouterApiKey = process.env["OPENROUTER_API_KEY"];
    const openRouter = new OpenRouterService(openRouterApiKey!);
    const reporter = new Reporter(verificationUrl, apiKey);

    const personSource = new PersonSource(openRouter);
    await personSource.load(url);
    const persons = personSource.getPersons();
    const answerRecords = buildAnswerRecords(persons);

    const verificationResult = await reporter.sendAnswer("people", answerRecords);

    const flag = extractFlag(verificationResult.message);
    if (flag) {
        console.log("✅ Flag found:", flag);
    } else {
        console.log("🛑 Flag not found");
    }

    /*console.log("Running extra task...");
    const anomalyResults = await extraTask(openRouter, records);
    console.log(anomalyResults);
*/
}

main().catch((error) => {
    if (error instanceof Error) {
        console.error("🛑 Error:", error.message);
    } else {
        console.error("🛑 Unknown error:", error);
    }
    process.exitCode = 1;
});