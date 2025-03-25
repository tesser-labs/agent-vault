import { OAuth2Client } from "google-auth-library";
import { config, type ProviderConfig } from "@/config";
import {
  AuthProvider,
  AuthUrlOptions,
  Credentials,
} from "@/authProviders/types";

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
      prompt: "consent",
    });
    return authorizeUrl;
  }
  async getAccessToken(code: string): Promise<Credentials | undefined> {
    const response = await this.oauth2Client.getToken(code);
    const access_token = response.tokens?.access_token || undefined;
    const refresh_token = response.tokens?.refresh_token || undefined;
    const expiry_date = response.tokens?.expiry_date || undefined;
    if (access_token) {
      return { access_token, refresh_token, expiry_date };
    }
  }
}

export { GoogleOAuth };
