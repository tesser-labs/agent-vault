import dotenv from "dotenv";
// Load environment variables
dotenv.config();

const { AUTH_REDIRECT_URL } = process.env;

if (!AUTH_REDIRECT_URL) {
  throw new Error("AUTH_REDIRECT_URL is not set");
}

export const generateAuthURL = ({
  authEndpoint,
  service,
  resource,
  agentName,
  redirectUrl = AUTH_REDIRECT_URL,
}: {
  authEndpoint: string;
  service: string;
  resource?: string;
  agentName: string;
  redirectUrl?: string;
}) => {
  const authUrl = new URL(`${authEndpoint}`);
  resource && authUrl.searchParams.set("resource", resource);
  authUrl.searchParams.set("redirectUrl", encodeURIComponent(redirectUrl));
  authUrl.searchParams.set("agent.name", encodeURIComponent(agentName));
  authUrl.searchParams.set("service", encodeURIComponent(service));
  return authUrl;
};
