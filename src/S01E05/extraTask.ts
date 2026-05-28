export async function extraTask(apiUrl: string, apiKey: string): Promise<string> {

    while (true) {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apiKey,
                task: "railway",
                answer: { action: "getstatus", route: "X-01" }
            })
        });
        const data = await response.json();

        console.log(JSON.stringify(data));

        if (data.code === 555) {
            return data.message?.match(/{FLG:[^}]+}/)[0];
        }

    }
}