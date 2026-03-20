export interface ChatRequest {
    sessionID: string;
    msg: string;
}

export interface ChatResponse {
    msg: string;
}


export interface AnswerRecord {
    url: string;
    sessionID: string;
}

