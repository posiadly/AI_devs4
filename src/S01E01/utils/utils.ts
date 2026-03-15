
import { AnswerRecord } from "../types.js";
import { Person, PersonWithTags, TaggedJob } from "../../tools/PersonSource/types.js";
import { OpenRouterService } from "../../tools/OpenRouterService.js";
import { tagPrompt } from "../../tools/PersonSource/prompts/tags.js";
import { taggingSchema } from "../../tools/PersonSource/schemas/tag.js";


export function buildAnswerRecords(records: PersonWithTags[]): AnswerRecord[] {
    return records
        .map((record) => {
            return {
                name: record.name,
                surname: record.surname,
                gender: record.gender,
                born: record.birthDate.getFullYear(),
                city: record.birthPlace,
                tags: record.tags,
            };
        })
}
