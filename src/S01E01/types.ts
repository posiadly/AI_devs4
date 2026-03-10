export interface Person {
    name: string;
    surname: string;
    gender: "M" | "F";
    birthDate: Date;
    birthPlace: string;
    birthCountry: string;
    job: string;
}

export interface JobDescriptionInput {
    id: number,
    jobDescription: string
}

export interface TaggedJob {
    id: number,
    tags: string[]
}

export interface TaggedJobs {
    jobs: TaggedJob[]
}

export interface AnswerRecord {
    name: string,
    surname: string,
    gender: "M" | "F",
    born: number,
    city: string,
    tags: string[]
}