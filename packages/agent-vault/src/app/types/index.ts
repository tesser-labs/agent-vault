export interface Connection {
  id: string;
  app: string;
  description?: string;
  client: string;
  accessToken: string;
  refreshToken: string;
  expiration: Date | "never";
}

export type TokenStatus = "valid" | "expiring" | "expired";

export type ActionMetadata = {
  name: string;
  logo?: string;
  title: string;
  description: string;
  btnText: string;
};
