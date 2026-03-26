

export async function extraTask(documentationUrl: string): Promise<string> {

    const response = await fetch(`${documentationUrl}/zalacznik-I.md`);
    return response.headers.get("x-flag")!;
}