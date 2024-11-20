export interface TokenConfig {
  secret: string;
  expiresIn: string;
  url?: string; // Optional for frontend URLs
}
