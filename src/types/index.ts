export interface Connection {
  app: string;
  description: string;
  client: string;
  accessToken: string;
  refreshToken: string;
  expiration: Date;
}

export type TokenStatus = "valid" | "expiring" | "expired";
