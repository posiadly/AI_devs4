import axios from "axios";
import { parse } from "csv-parse/sync";
import { Person } from "./types.js";
import { applyFilters, buildAnswerRecords, createJobDescriptionInput, tagJobs } from "./utils/utils.js";
import { OpenRouterService } from "../tools/OpenRouterService.js";
import { selectedTag, tags } from "./const.js";
import { Reporter } from "../tools/Reporter.js";
import { extractFlag } from "../tools/FlagExtractor.js";
import { requireEnv } from "../tools/EnvLoader.js";
import fs from "fs";
import { extraTask } from "./extraTask.js";

async function main() {
    const url = requireEnv("S01E01_PEOPLE_URL");
    const verificationUrl = requireEnv("VERIFICATION_URL");
    const apiKey = requireEnv("API_KEY");

    // Use Open Router if OPENROUTER_API_KEY is set, otherwise OpenAI
    const openRouterApiKey = process.env["OPENROUTER_API_KEY"];
    const openRouter = new OpenRouterService(openRouterApiKey!);
    const reporter = new Reporter(verificationUrl, apiKey);

    const csvContent = (await axios.get(url)).data;



    const records = parse<Person>(csvContent, {
        columns: true,        // use first row as keys
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true,
        cast: (value, context) =>
            context.column === "birthDate" ? new Date(value) : value,
    });

    /*const filteredRecords = applyFilters(records);
    const taggedJobs = await tagJobs(openRouter, tags, createJobDescriptionInput(filteredRecords));
    const answerRecords = buildAnswerRecords(filteredRecords, taggedJobs, selectedTag);

    const verificationResult = await reporter.sendAnswer("people", answerRecords);

    const flag = extractFlag(verificationResult.message);
    if (flag) {
        console.log("✅ Flag found:", flag);
    } else {
        console.log("🛑 Flag not found");
    }*/

    console.log("Running extra task...");
    const anomalyResults = await extraTask(openRouter, records);
    console.log(anomalyResults);

}

main().catch((error) => {
    if (error instanceof Error) {
        console.error("🛑 Error:", error.message);
    } else {
        console.error("🛑 Unknown error:", error);
    }
    process.exitCode = 1;
});