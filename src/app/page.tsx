import { authProviders, AuthSession } from "@/providers";
import { redirect } from "next/navigation";
import sessionManager from "@/cache/session";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    resource?: string;
    udid: string;
    redirectUrl?: string;
  }>;
}) {
  const { resource, udid, redirectUrl } = await searchParams;

  // generate a session id as a random uuid
  const sessionId = crypto.randomUUID();
  if (!resource || !udid || !redirectUrl) {
    // Handle the case when required query parameters are missing
    throw new Error(
      "Missing required query parameters: resource or udid or redirectUrl"
    );
  } else {
    const session: AuthSession = {
      id: sessionId,
      resource,
      udid,
      redirectUrl,
    };

    // store the session in the database
    sessionManager.set(sessionId, session);

    // ToDO: check the credentials for the user DID to pull their available connections
    const authUrl = authProviders[resource]?.generateAuthUrl({
      state: sessionId,
    });
    if (authUrl) {
      redirect(authUrl);
    } else {
      throw new Error("Invalid resource type");
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
