
import { AnswerRecord, JobDescriptionInput, Person, TaggedJob, TaggedJobs } from "../types.js";
import { OpenAIService } from "../../tools/OpenAIService.js";
import { tagPrompt } from "../prompts/tags.js";
import { taggingSchema } from "../schemas/tag.js";


export function applyFilters(records: Person[]): Person[] {
    const todayYear = new Date().getFullYear();
    return records.filter(row => row.gender === "M" &&
        row.birthDate.getFullYear() >= todayYear - 40 && row.birthDate.getFullYear() <= todayYear - 20 &&
        row.birthPlace === "Grudziądz");
}

export function createJobDescriptionInput(records: Person[]): JobDescriptionInput[] {
    return records.map((row, index) => ({ id: index, jobDescription: row.job }));
}

export async function tagJobs(openai: OpenAIService, availableTags: string[], inputData: JobDescriptionInput[]): Promise<TaggedJob[]> {
    const prompt = tagPrompt(availableTags, inputData);
    const response = await openai.parse<TaggedJobs>({
        model: "gpt-4o",
        systemPrompt: prompt,
        responseFormat: taggingSchema
    })
    return response.jobs;
}


export function buildAnswerRecords(records: Person[], taggedJobs: TaggedJob[], selectedTag: string): AnswerRecord[] {
    const byId = new Map(taggedJobs.map((t) => [t.id, t]));
    return records
        .map((record, index) => {
            const tagged = byId.get(index);
            if (!tagged?.tags.includes(selectedTag)) return null;
            return {
                name: record.name,
                surname: record.surname,
                gender: record.gender,
                born: record.birthDate.getFullYear(),
                city: record.birthPlace,
                tags: tagged.tags,
            };
        })
        .filter((r): r is AnswerRecord => r !== null);
}
