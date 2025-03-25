export interface Connection {
  app: string;
  description?: string;
  client: string;
  accessToken: string;
  refreshToken: string;
  expiration: Date | "never";
}

export type TokenStatus = "valid" | "expiring" | "expired";
