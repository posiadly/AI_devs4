export async function extraTask(handler: Function) {
    const result = await handler({ name: "Martin", surname: "Handford", birthYear: 1987 }) as { code: number, message: string };
    return result.message;
}