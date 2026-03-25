import { PersonSource } from "../tools/PersonSource/PersonSource.js";
import { Person } from "../tools/PersonSource/types.js";
import { AccessLevel, DistanceQuery, DistanceResult, Location, PersonLocations, PowerPlant } from "./types.js";
import { OpenRouterService } from "../tools/OpenRouterService.js";
import { locationPrompt } from "./prompts/locationPrompt.js";
import { locationsOutputSchema } from "./schemas/outputs.js";
import { getDistance } from "geolib";

export function prepareHandlers(apiKey: string, openRouter: OpenRouterService, findHimLocationsUrl: string, locationUrl: string, accessLevelUrl: string, personSource: PersonSource) {
    return {
        async get_power_plants(): Promise<{ power_plants: PowerPlant[] }> {
            const response = await fetch(findHimLocationsUrl);
            const data = await response.json();
            return data;
        },
        async get_person_list(): Promise<Person[]> {
            return personSource.getPersons().map((person) => ({
                name: person.name,
                surname: person.surname,
                gender: person.gender,
                birthDate: person.birthDate,
                birthYear: person.birthYear,
                birthPlace: person.birthPlace,
                birthCountry: person.birthCountry,
                job: person.job,
            }));
        },
        async get_persons_location({ persons }: { persons: { name: string; surname: string }[] }): Promise<PersonLocations[]> {
            return await Promise.all(persons.map(async (person) => {
                const response = await fetch(locationUrl, {
                    method: "POST",
                    body: JSON.stringify({ apikey: apiKey, name: person.name, surname: person.surname }),
                });
                const data = await response.json();
                return {
                    name: person.name,
                    surname: person.surname,
                    locations: data as Location[],
                } as PersonLocations;
            }));
        },
        async get_city_coordinates({ cities }: { cities: string[] }): Promise<Location[]> {
            const prompt = locationPrompt(cities);
            const locations = await openRouter.parse<Location[]>({
                model: "openai/gpt-4.1",
                systemPrompt: prompt,
                userPrompt: JSON.stringify(cities),
                responseFormat: locationsOutputSchema,
            });
            return locations;
        },
        async find_closest_points_from_sets({ set1, set2 }: { set1: Location[], set2: Location[] }): Promise<DistanceResult> {
            let minDistance = Infinity;
            let closestPoints: { from: Location, to: Location } = { from: set1[0]!, to: set2[0]! };
            for (const point1 of set1) {
                for (const point2 of set2) {
                    const distance = getDistance(point1, point2);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestPoints = { from: point1, to: point2 };
                    }
                }
            }

            return { from: closestPoints.from, to: closestPoints.to, distance: minDistance } as DistanceResult;
        },
        async get_access_level({ name, surname, birthYear }: { name: string, surname: string, birthYear: number }): Promise<AccessLevel> {
            const response = await fetch(accessLevelUrl, {
                method: "POST",
                body: JSON.stringify({ apikey: apiKey, name: name, surname: surname, birthYear: birthYear }),
            });
            return await response.json() as AccessLevel;
        }
    }
};