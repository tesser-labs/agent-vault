import { authProviders, AuthSession } from "@/authProviders";
import { redirect } from "next/navigation";
import sessionManager from "@/cache/session";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ provider: string }>;
  searchParams: Promise<{
    "agent.name": string;
    provider: string;
    resource?: string;
    service: string;
    redirectUrl: string;
  }>;
}) {
  const {
    resource,
    "agent.name": agentName,
    service,
    redirectUrl,
  } = await searchParams;
  const { provider } = await params;

  // generate a session id as a random uuid
  const sessionId = crypto.randomUUID();
  if (!provider || !agentName || !service || !redirectUrl) {
    // Handle the case when required query parameters are missing
    throw new Error(
      "Missing required query parameters: provider or agentName or service or redirectUrl"
    );
  } else {
    const session: AuthSession = {
      context: {
        provider,
        agent: { name: agentName },
        resource,
        service,
      },
      redirectUrl,
    };

    // store the session in the database
    await sessionManager.set(sessionId, session);

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
