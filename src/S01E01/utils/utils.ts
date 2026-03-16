
import { AnswerRecord } from "../types.js";
import { ExtendedPerson } from "../../tools/PersonSource/types.js";



export function buildAnswerRecords(records: ExtendedPerson[]): AnswerRecord[] {
    return records
        .map((record) => {
            return {
                name: record.name,
                surname: record.surname,
                gender: record.gender,
                born: record.birthDate.getFullYear(),
                city: record.birthPlace,
                tags: record.tags,
            };
        })
}
