import { ExtendedPerson, Person } from "./types.js"
import { JobDescriptionInput, TaggedJob, TaggedJobs } from "./types.js";
import { parse } from "csv-parse/sync";
import { OpenRouterService } from "../OpenRouterService.js";
import { tagPrompt } from "./prompts/tags.js";
import { selectedTag, tags } from "./const.js";
import { taggingSchema } from "./schemas/tag.js";


export class PersonSource {
    private persons: ExtendedPerson[] = [];
    public constructor(private openRouter: OpenRouterService) {
    }

    public getPersons(): ExtendedPerson[] {
        return this.persons;
    }
    public async load(url: string) {

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const csvContent = await response.text();

        const records = parse<Person>(csvContent, {
            columns: true,        // use first row as keys
            skip_empty_lines: true,
            relax_quotes: true,
            trim: true,
            cast: (value, context) =>
                context.column === "birthDate" ? new Date(value) : value,
        });

        const filteredRecords = this.applyFilters(records);
        const taggedJobs = await this.tagJobs(tags, this.createJobDescriptionInput(filteredRecords));
        this.persons = this.selectPersons(filteredRecords, taggedJobs, selectedTag).map((person) => ({ ...person, birthYear: person.birthDate.getFullYear() }));

    }

    private applyFilters(records: Person[]): Person[] {
        const todayYear = new Date().getFullYear();
        return records.filter(row => row.gender === "M" &&
            row.birthDate.getFullYear() >= todayYear - 40 && row.birthDate.getFullYear() <= todayYear - 20 &&
            row.birthPlace === "Grudziądz");
    }
    private async tagJobs(availableTags: string[], inputData: JobDescriptionInput[]): Promise<TaggedJob[]> {
        const prompt = tagPrompt(availableTags, inputData);
        const response = await this.openRouter.parse<TaggedJobs>({
            model: "openai/gpt-4o",
            systemPrompt: prompt,
            responseFormat: taggingSchema
        });
        return response.jobs;
    }
    private createJobDescriptionInput(records: Person[]): JobDescriptionInput[] {
        return records.map((row, index) => ({ id: index, jobDescription: row.job }));
    }

    private selectPersons(records: Person[], taggedJobs: TaggedJob[], selectedTag: string): ExtendedPerson[] {
        const byId = new Map(taggedJobs.map((t) => [t.id, t]));
        return records
            .map((record, index) => {
                const tagged = byId.get(index);
                if (!tagged?.tags.includes(selectedTag)) return null;
                return { ...record, tags: tagged.tags, birthYear: record.birthDate.getFullYear() };
            })
            .filter((r): r is ExtendedPerson => r !== null);
    }
}




