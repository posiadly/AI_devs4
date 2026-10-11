import "dotenv/config";

export function requireEnv(name: string, defaultValue?: string): string {
    const value = process.env[name];
    if (value) return value;
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`${name} is not set`);
}
