import { OAuth2Client } from "google-auth-library";
import { config, type ProviderConfig } from "@/config";

export interface AuthUrlOptions {
  state?: string;
  resource?: string;
}
interface AuthProvider {
  generateAuthUrl(options?: AuthUrlOptions): string;
  getAccessToken(
    code: string,
    options?: AuthUrlOptions
  ): Promise<Credentials | undefined>;
}

export interface Credentials {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export interface AuthSession {
  id: string;
  provider: string;
  resource?: string;
  udid: string;
  redirectUrl: string;
}

class GoogleOAuth implements AuthProvider {
  oauth2Client;
  scopes: string[];
  constructor(googleConfig: ProviderConfig = config.providers.google) {
    const CLIENT_ID = googleConfig.clientId;
    const CLIENT_SECRET = googleConfig.clientSecret;
    const REDIRECT_URI = googleConfig.redirectUri;
    const SCOPES = googleConfig.scopes;

    if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
      throw new Error("Missing Google OAuth2 credentials");
    }

    this.oauth2Client = new OAuth2Client(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    this.scopes = [...SCOPES];
  }

  generateAuthUrl(options: AuthUrlOptions) {
    const authorizeUrl = this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.scopes,
      state: options.state,
    });
    return authorizeUrl;
  }
  async getAccessToken(code: string) {
    const response = await this.oauth2Client.getToken(code);
    const access_token = response.tokens?.access_token || undefined;
    const refresh_token = response.tokens?.refresh_token || undefined;
    const expiry_date = response.tokens?.expiry_date || undefined;
    if (access_token) {
      return { access_token, refresh_token, expiry_date };
    }
  }
}

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

const authProviders: Record<string, AuthProvider> = {
  google: new GoogleOAuth(),
  shopify: new ShopifyOAuth(),
};

export { authProviders };
