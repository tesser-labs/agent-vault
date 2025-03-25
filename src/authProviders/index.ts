import { GoogleOAuth } from "./providers/google";
import { ShopifyOAuth } from "./providers/shopify";

import type { AuthProvider } from "@/authProviders/types";

const authProviders: Record<string, AuthProvider> = {
  google: new GoogleOAuth(),
  shopify: new ShopifyOAuth(),
};

export type * from "./types";

export { authProviders };
