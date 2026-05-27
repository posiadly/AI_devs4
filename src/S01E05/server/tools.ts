import { z } from "zod";


const apiCallerInputSchema = z.object({
    parameters: z.json().describe('The parameters to call the API with'),
});

type ApiCallerInput = z.infer<typeof apiCallerInputSchema>;

export const tools = (apiUrl: string, apiKey: string) => ({
    apiCaller: {
        name: 'api_caller',
        config: {
            title: 'API Caller',
            description: 'Calls an railway API. The functionality of API may be discovered calling it with "action": "help"',
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
                content: [{ type: "text" as const, text: JSON.stringify(object) }],
                structuredContent: { result: object }
            };
        }
    },
    wait: {
        name: 'wait',
        config: {
            title: 'Wait',
            description: 'Waits for a specified amount of time',
            inputSchema: z.object({
                seconds: z.number().describe('The number of seconds to wait. Moment is 5 seconds')
            })
        },
        handler: async ({ seconds }: { seconds: number }) => {
            await new Promise(resolve => setTimeout(resolve, seconds * 1000));
            return {
                content: [{ type: "text" as const, text: `Waited for ${seconds} seconds` }]
            };
        }
    }
});
