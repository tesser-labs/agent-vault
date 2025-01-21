// src/config/index.ts
export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface Config {
  providers: Record<string, ProviderConfig>;
  storage: {
    basePath: string;
  };
}

export const config: Config = {
  providers: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: process.env.GOOGLE_REDIRECT_URI!,
      scopes: ["https://www.googleapis.com/auth/gmail.modify"],
    },
  },
  storage: {
    basePath: "./store",
  },
};
