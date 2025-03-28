import {
  AuthProvider,
  AuthUrlOptions,
  Credentials,
} from "@/authProviders/types";
import { config, type ProviderConfig } from "@/config";

class ShopifyOAuth implements AuthProvider {
  getAuthorizationEndpoint = (store) =>
    `https://${store}.myshopify.com/admin/oauth/authorize`;
  getTokenEndpoint = (store) =>
    `https://${store}.myshopify.com/admin/oauth/access_token`;

  scopes: string[];
  clientId: string;
  redirectUri: string;
  clientSecret: string;

  constructor(shopifyConfig: ProviderConfig = config.providers.shopify) {
    const { clientId, scopes, clientSecret, redirectUri } = shopifyConfig;
    if (!clientId || !redirectUri || !clientSecret) {
      throw new Error("Missing Shopify OAuth2 credentials");
    }
    this.clientId = clientId;
    this.scopes = scopes ? [...scopes] : [];
    this.redirectUri = redirectUri;
    this.clientSecret = clientSecret;
  }

  generateAuthUrl(options: AuthUrlOptions) {
    const { resource: store, state } = options;
    if (!store) {
      throw new Error('Missing resource. "resource" option is required');
    }
    const authUrl = new URL(this.getAuthorizationEndpoint(store));
    authUrl.searchParams.set("client_id", this.clientId);
    authUrl.searchParams.set("scope", this.scopes.join(","));
    authUrl.searchParams.set("redirect_uri", this.redirectUri);
    authUrl.searchParams.set("state", state || "nonce");
    return authUrl.toString();
  }

  async getAccessToken(
    code: string,
    options: AuthUrlOptions
  ): Promise<Credentials | undefined> {
    try {
      const { resource: store } = options || {};
      if (!store) {
        throw new Error("Missing resource. 'resource' option is required");
      }
      if (!code) {
        throw new Error("No code provided");
      }

      // Exchange the authorization code for an access token
      const tokenUrl = new URL(this.getTokenEndpoint(store));

      const tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
        }),
      });
      const tokenData = await tokenResponse.json();
      return {
        access_token: tokenData.access_token,
      };
    } catch (error) {
      console.error("Error exchanging code for token", error);
      throw new Error("Error exchanging code for token");
    }
  }
}

export { ShopifyOAuth };
