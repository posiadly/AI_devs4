import type { ToolDefinitionJson } from "@openrouter/sdk/models/tooldefinitionjson";

export const getPowerPlantsTool: ToolDefinitionJson = {
    type: "function",
    function: {
        name: "get_power_plants",
        description: "Returns all available power plants and their status.",
        parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
        }
    }
};

export const getPersonListTool: ToolDefinitionJson = {
    type: "function",
    function: {
        name: "get_person_list",
        description: "Returns the list of filtered persons.",
        parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
        }
    }
};

export const getPersonsLocationTool: ToolDefinitionJson = {
    type: "function",
    function: {
        name: "get_persons_location",
        description: "Gets the current location(s) for each person by name and surname. Pass a list of persons.",
        parameters: {
            type: "object",
            properties: {
                persons: {
                    type: "array",
                    description: "List of persons to locate (name and surname for each).",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "First name of the person." },
                            surname: { type: "string", description: "Surname (last name) of the person." }
                        },
                        required: ["name", "surname"],
                        additionalProperties: false
                    },
                    minItems: 1
                }
            },
            required: ["persons"],
            additionalProperties: false
        }
    }
};

export const getCityCoordinatesTool: ToolDefinitionJson = {
    type: "function",
    function: {
        name: "get_city_coordinates",
        description: "Given a list of city names, returns coordinates for each city (same order).",
        parameters: {
            type: "object",
            properties: {
                cities: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 1,
                    description: "City names to geolocate."
                }
            },
            required: ["cities"],
            additionalProperties: false
        }
    }
};



export const getAccessLevelTool: ToolDefinitionJson = {
    type: "function",
    function: {
        name: "get_access_level",
        description: "Looks up a person's access level based on their name, surname, and birth year.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "First name of the person." },
                surname: { type: "string", description: "Surname (last name) of the person." },
                birthYear: { type: "number", description: "Four-digit birth year (e.g. 1987)." }
            },
            required: ["name", "surname", "birthYear"],
            additionalProperties: false
        }
    }
};

const locationSchema = {
    type: "object" as const,
    properties: {
        latitude: { type: "number" as const, description: "Latitude in decimal degrees." },
        longitude: { type: "number" as const, description: "Longitude in decimal degrees." }
    },
    required: ["latitude", "longitude"],
    additionalProperties: false
};

export const findClosestPointsFromSetsTool: ToolDefinitionJson = {
    type: "function",
    function: {
        name: "find_closest_points_from_sets",
        description: "Finds the pair of points (one from each set) that are closest to each other. Returns the two points and the distance in meters.",
        parameters: {
            type: "object",
            properties: {
                set1: {
                    type: "array",
                    description: "First set of coordinates (latitude, longitude).",
                    items: locationSchema,
                    minItems: 1
                },
                set2: {
                    type: "array",
                    description: "Second set of coordinates (latitude, longitude).",
                    items: locationSchema,
                    minItems: 1
                }
            },
            required: ["set1", "set2"],
            additionalProperties: false
        }
    }
};

export const allTools: ToolDefinitionJson[] = [
    getPowerPlantsTool,
    getPersonListTool,
    getPersonsLocationTool,
    getCityCoordinatesTool,
    getAccessLevelTool,
    findClosestPointsFromSetsTool
];