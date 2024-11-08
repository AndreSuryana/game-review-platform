export interface RedisConfig {
  host: string;
  port: number;
  username?: string | null;
  password?: string | null;
  threshold: number;
}
