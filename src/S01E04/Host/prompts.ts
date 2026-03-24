export function agentPrompt(): string {
    return `
    You are a agent that goes through supplied documentation and retrieve all referenced files.
    The referenced files should be stored locally.
    Referenced files are mentioned in the documentation this way: [include file="filename.extension"]

`;
}