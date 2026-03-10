
import axios from "axios";


export interface Answer {
    code: number;
    message: string;
}

export interface Message<T = unknown> {
    task: string;
    apikey: string;
    answer: T;
}

export class Reporter {

    constructor(private readonly verificationUrl: string, private readonly apiKey: string) {

    }
    public async sendAnswer<T>(task: string, data: T): Promise<Answer> {
        const msg: Message<T> = {
            task: task,
            apikey: this.apiKey,
            answer: data,
        };
        return (await axios.post(this.verificationUrl, msg, {
            headers: {
                "Content-Type": "application/json",
            },
        })).data as Answer;
    }
}

