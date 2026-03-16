export interface PowerPlant {
    is_active: boolean;
    power: string;
    code: string;
}

export interface Location {
    latitude: number;
    longitude: number;
}

export interface PersonLocations {
    name: string;
    surname: string;
    locations: Location[];
}

export interface AccessLevel {
    name: string;
    surname: string;
    accessLevel: number;
}

export interface DistanceQuery {
    from: Location;
    to: Location;
}
export interface DistanceResult {
    from: Location;
    to: Location;
    distance: number;
}

export interface AgentResult {
    person: {
        name: string;
        surname: string;
        distance: number;
        access_level: number;
    };
    power_plant: string;
}

export interface AnswerRecord {

    name: string;
    surname: string;
    accessLevel: number;
    powerPlant: string;
}