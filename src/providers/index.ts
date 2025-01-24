import { OAuth2Client } from "google-auth-library";
import { config, type ProviderConfig } from "@/config";

interface AuthProvider {
  generateAuthUrl(options: Record<string, string>): string;
  getAccessToken(code: string): Promise<Credentials | undefined>;
}

export interface Credentials {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
}

export interface AuthSession {
  id: string;
  resource: string;
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

  generateAuthUrl(options: Record<string, string>) {
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
  store = "tesser-test.myshopify.com";
  authorizationEndpoint = `https://${this.store}/admin/oauth/authorize`;
  tokenEndpoint = `https://${this.store}/admin/oauth/access_token`;

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

  generateAuthUrl(options: Record<string, string>) {
    const authUrl = new URL(this.authorizationEndpoint);
    authUrl.searchParams.set("client_id", this.clientId);
    authUrl.searchParams.set("scope", this.scopes.join(","));
    authUrl.searchParams.set("redirect_uri", this.redirectUri);
    authUrl.searchParams.set("state", options.state || "nonce");
    console.log(authUrl.toString());
    return authUrl.toString();
  }

  async getAccessToken(code: string): Promise<Credentials | undefined> {
    try {
      if (!code) {
        throw new Error("No code provided");
      }

      // Exchange the authorization code for an access token
      const tokenUrl = new URL(this.tokenEndpoint);
      console.log(tokenUrl.toString());
      const tokenResponse = await fetch(this.tokenEndpoint, {
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
