import { authProviders, AuthSession } from "@/providers";
import { redirect } from "next/navigation";
import sessionManager from "@/cache/session";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ provider: string }>;
  searchParams: Promise<{
    resource?: string;
    udid: string;
    redirectUrl?: string;
  }>;
}) {
  const { resource, udid, redirectUrl } = await searchParams;
  const { provider } = await params;

  // generate a session id as a random uuid
  const sessionId = crypto.randomUUID();
  if (!provider || !udid || !redirectUrl) {
    // Handle the case when required query parameters are missing
    throw new Error(
      "Missing required query parameters: provider or udid or redirectUrl"
    );
  } else {
    const session: AuthSession = {
      id: sessionId,
      provider,
      resource,
      udid,
      redirectUrl,
    };

    // store the session in the database
    await sessionManager.set(sessionId, session);

    // ToDO: check the credentials for the user DID to pull their available connections
    const authUrl = authProviders[provider]?.generateAuthUrl({
      state: sessionId,
      resource,
    });
    if (authUrl) {
      redirect(authUrl);
    } else {
      throw new Error("Invalid provider type");
    }
  }
  // Render a loading or error message while redirecting
  return (
    <div>
      <h1>Auth Service Page</h1>
      <p>Performing authentication...</p>
    </div>
  );
}
