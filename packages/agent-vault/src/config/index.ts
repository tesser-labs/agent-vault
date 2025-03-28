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
  auth: {
    baseUrl: string;
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
    shopify: {
      clientId: process.env.SHOPIFY_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CLIENT_SECRET!,
      redirectUri: process.env.SHOPIFY_REDIRECT_URI!,
      // https://shopify.dev/docs/api/usage/access-scopes#authenticated-access-scopes
      scopes: [
        "read_products",
        "write_products",
        "read_orders",
        "write_orders",
        "read_customers",
        "write_customers",
      ],
    },
  },
  storage: {
    basePath: "./store",
  },
  auth: {
    baseUrl: "http://localhost:3000/auth",
  },
};
