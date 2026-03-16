export function locationPrompt(cities: string[]): string {
    return `
    You are a location prompt. You are given a list of cities.
    You need to return the coordinates of the cities.
    You need to return the coordinates in the following format:
    {
        "latitude": number,
        "longitude": number
    }
    Cities:
    ${cities.join(", ")}
    `;
}