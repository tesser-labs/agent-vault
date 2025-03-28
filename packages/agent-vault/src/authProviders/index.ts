import { GoogleOAuth } from "./providers/google";
import { ShopifyOAuth } from "./providers/shopify";
import { config } from "@/config";
import type { AuthProvider } from "@/authProviders/types";

const AUTH_BASE_URL = config.auth.baseUrl;

const authProviders: Record<string, AuthProvider> = {
  google: new GoogleOAuth(),
  shopify: new ShopifyOAuth(),
};

const getAuthEndpoint = ({ provider }: { provider: string }) => {
  const authEndpointURL = new URL(provider, AUTH_BASE_URL);
  return authEndpointURL;
};

export type * from "./types";

export { authProviders, getAuthEndpoint };
