export interface DatabaseConfig {
    host: string;
    port: number;
    name: string;
    user: string | null;
    password: string | null;
}