import { AnswerRecord } from "../types.js";
import { AgentResult } from "../types.js";

export function buildAnswerRecords(agentResult: AgentResult): AnswerRecord {
    return {
        name: agentResult.person.name,
        surname: agentResult.person.surname,
        accessLevel: agentResult.person.access_level,
        powerPlant: agentResult.power_plant,
    }
}
