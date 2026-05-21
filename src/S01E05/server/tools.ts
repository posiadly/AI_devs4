import { z } from "zod";


const apiCallerInputSchema = z.object({
    parameters: z.json().describe('The parameters to call the API with'),
});

type ApiCallerInput = z.infer<typeof apiCallerInputSchema>;

export const tools = (apiUrl: string, apiKey: string) => [{
    name: 'api_caller',
    config:

    {
        title: 'API Caller',
        description: 'Calls an API',
        inputSchema: apiCallerInputSchema,
        outputSchema: z.object({
            result: z.json().describe('The result of the API call')
        })
    },
    handler: async ({ parameters }: ApiCallerInput) => {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apiKey,
                task: "railway",
                answer: JSON.stringify(parameters)
            })
        });
        const object = await response.json();
        return {
            content: [{ type: "text" as const, text: "Result of API call" }],
            structuredContent: { result: object }
        };

    }
}]
