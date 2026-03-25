import type { ResponseFormatJSONSchema } from "@openrouter/sdk/models/responseformatjsonschema";

export const locationsOutputSchema: ResponseFormatJSONSchema = {
    type: "json_schema",
    jsonSchema: {
        name: "locations_output",
        schema: {
            type: "object",
            properties: {
                locations: {
                    type: "array",
                    description: "List of coordinates, one per input city (same order).",
                    items: {
                        type: "object",
                        properties: {
                            latitude: {
                                type: "number",
                                description: "Latitude in decimal degrees."
                            },
                            longitude: {
                                type: "number",
                                description: "Longitude in decimal degrees."
                            }
                        },
                        required: ["latitude", "longitude"],
                        additionalProperties: false
                    }
                }
            },
            required: ["locations"],
            additionalProperties: false
        },
        strict: true
    }
};

export const pesonClosestToPowerPlantOutputSchema: ResponseFormatJSONSchema = {
    type: "json_schema",
    jsonSchema: {
        name: "person_closest_to_power_plant_output",
        schema: {
            type: "object",
            properties: {
                person: {
                    type: "object",
                    properties: {
                        name: { type: "string", description: "Name of the person." },
                        surname: { type: "string", description: "Surname of the person." },
                        distance: { type: "number", description: "Distance in meters between the person and the power plant." },
                        access_level: { type: "number", description: "Access level of the person." }
                    },
                    required: ["name", "surname", "distance", "access_level"],
                    additionalProperties: false
                },
                power_plant: { type: "string", description: "Code of the power plant." }
            },
            required: ["person", "power_plant"],
            additionalProperties: false
        },
        strict: true
    }
};