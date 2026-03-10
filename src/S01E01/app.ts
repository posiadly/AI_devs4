import axios from "axios";
import { parse } from "csv-parse/sync";
import { Person } from "./types.js";
import { applyFilters, buildAnswerRecords, createJobDescriptionInput, tagJobs } from "./utils/utils.js";
import { OpenAIService } from "../tools/OpenAIService.js";
import { selectedTag, tags } from "./const.js";
import { Reporter } from "../tools/Reporter.js";
import { extractFlag } from "../tools/FlagExtractor.js";
import { requireEnv } from "../tools/EnvLoader.js";

async function main() {
    const openaiApiKey = requireEnv("OPENAI_API_KEY");
    const url = requireEnv("S01E01_PEOPLE_URL");
    const verificationUrl = requireEnv("VERIFICATION_URL");
    const apiKey = requireEnv("API_KEY");

    const openai = new OpenAIService(openaiApiKey);
    const reporter = new Reporter(verificationUrl, apiKey);

    const response = await axios.get(url);
    const records = parse<Person>(response.data, {
        columns: true,        // use first row as keys
        skip_empty_lines: true,
        relax_quotes: true,
        trim: true,
        cast: (value, context) =>
            context.column === "birthDate" ? new Date(value) : value,
    });

    const filteredRecords = applyFilters(records);
    const taggedJobs = await tagJobs(openai, tags, createJobDescriptionInput(filteredRecords));
    const answerRecords = buildAnswerRecords(filteredRecords, taggedJobs, selectedTag);

    const verificationResult = await reporter.sendAnswer("people", answerRecords);

    const flag = extractFlag(verificationResult.message);
    if (flag) {
        console.log("✅ Flag found:", flag);
    } else {
        console.log("🛑 Flag not found");
    }

}

main().catch((error) => {
    if (error instanceof Error) {
        console.error("🛑 Error:", error.message);
    } else {
        console.error("🛑 Unknown error:", error);
    }
    process.exitCode = 1;
});