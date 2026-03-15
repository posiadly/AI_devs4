import { JobDescriptionInput } from "../types.js";

export function tagPrompt(availableTags: string[], inputData: JobDescriptionInput[]): string {
    return `
    You are a highly specialized AI assistant for Human Resources, tasked with analyzing and categorizing job descriptions. 
    Your expertise lies in understanding the core responsibilities of a role and assigning relevant tags from a predefined list. 
    You must provide your output in a precise JSON format.

    Your task is to analyze the job descriptions provided in the 'inputData' array. 
    For each job description object, you must assign a list of one or more relevant tags from the 'availableTags' list.

    Rules:
    1. Carefully read and understand the 'jobDescription' for each entry.
    2. From the 'availableTags' list, select all tags that accurately describe the role. A single job can have multiple tags.
    3. You MUST only use tags from the provided 'availableTags' list. Do not invent new tags or use tags not on the list.
    4. Your final output must be a single, valid JSON array of objects that strictly follows the provided JSON schema. 
        
availableTags: 
[${availableTags.join(", ")}]

inputData:
${JSON.stringify(inputData)}

    `;
}