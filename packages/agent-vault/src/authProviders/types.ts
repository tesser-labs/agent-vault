export interface AuthUrlOptions {
  state?: string;
  resource?: string;
}

export type UserInfo = {
  did?: string;
  name?: string;
};

export type AgentInfo = {
  did?: string;
  name?: string;
};

export type Credentials = {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
};

export type Context = {
  provider: string;
  resource?: string;
  agent?: AgentInfo;
  user?: UserInfo;
  service?: string;
};

export type Connection = Credentials & Context;

export interface AuthSession {
  context: Context;
  redirectUrl: string;
}

export interface AuthProvider {
  generateAuthUrl(options?: AuthUrlOptions): string;
  getAccessToken(
    code: string,
    options?: AuthUrlOptions
  ): Promise<Credentials | undefined>;
}
