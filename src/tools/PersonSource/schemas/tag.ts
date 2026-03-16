import type { ResponseFormatJSONSchema } from "@openrouter/sdk/esm/models/responseformatjsonschema";

export const taggingSchema: ResponseFormatJSONSchema = {
    type: "json_schema",
    jsonSchema
        : {
        name: "JobTaggingResponse",
        strict: true,
        schema: {
            type: "object",
            properties: {
                jobs: {
                    type: "array",
                    description: "An array of job objects, each containing its original ID and a list of assigned tags.",
                    items: {
                        type: "object",
                        properties: {
                            id: {
                                type: "integer",
                                description: "The unique identifier from the input data for the job description."
                            },
                            tags: {
                                type: "array",
                                description: "A list of relevant tags assigned to the job description.",
                                minItems: 1,
                                items: {
                                    type: "string",
                                    enum: [
                                        "IT", "transport", "edukacja", "medycyna",
                                        "praca z ludźmi", "praca z pojazdami", "praca fizyczna"
                                    ]
                                }
                            }
                        },
                        required: ["id", "tags"],
                        additionalProperties: false // REQUIRED for all objects in strict mode
                    }
                }
            },
            required: ["jobs"], // Every property in the root must be required
            additionalProperties: false // REQUIRED for the root object too
        }
    }
};