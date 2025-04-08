import { authProviders, AuthSession } from "@/authProviders";
import { redirect } from "next/navigation";
import sessionManager from "@/cache/session";
import { ActionMetadata } from "@/app/types";

const authActionMetadata: Record<string, ActionMetadata> = {
  shopify: {
    title: "Login to your Shopify Store",
    name: "shopify",
    description:
      "login to your Shopify Store to allow access to your store information",
    logo: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-shopping-bag-full-color-66166b2e55d67988b56b4bd28b63c271e2b9713358cb723070a92bde17ad7d63.svg",
    btnText: "Login to Shopify",
  },
  google: {
    title: "Login to Gmail",
    name: "gmail",
    description:
      "login to your Google account to allow access to your gmail box, so I can fetch your emails for you",
    logo: "https://lh3.googleusercontent.com/0rpHlrX8IG77awQMuUZpQ0zGWT7HRYtpncsuRnFo6V3c8Lh2hPjXnEuhDDd-OsLz1vua4ld2rlUYFAaBYk-rZCODmi2eJlwUEVsZgg",
    btnText: "Login to Gmail",
  },
};

function getLoginActionMetadata(provider: string, service: string) {
  const actionMetadata = authActionMetadata[provider];
  if (!actionMetadata) {
    return {
      title: `Login to ${provider}`,
      name: provider,
      description: `login to your ${provider.toUpperCase()} account to allow access to your ${
        service?.toUpperCase() || ""
      } information`,
      btnText: `Login to ${provider}`,
    };
  }
  return actionMetadata;
}

function AuthAction({
  actionMetadata,
  authUrl,
  agentName,
}: {
  actionMetadata: ActionMetadata;
  authUrl: string;
  agentName: string;
}) {
  const { name, logo, title, description, btnText } = actionMetadata;
  return (
    <div className="border gap-3 shadow-sm flex flex-col items-center justify-center w-full h-full p-3">
      <div className="flex flex-row gap-3 items-center justify-center w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logo && (
          <img
            src={logo}
            alt={name}
            className="w-16 h-16"
          />
        )}
        <div className="flex flex-col items-center justify-center w-full h-full">
          <h1 className="text-2xl">{title}</h1>
          <p className="text-gray-500">{description}</p>
        </div>
        <a
          href={authUrl}
          className="bg-blue-500 text-white px-4 py-2 rounded-md text-center"
        >
          {btnText || "Continue"}
        </a>
      </div>
    </div>
  );
}

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
  console.log(await searchParams);
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
    /*
    if (authUrl) {
      redirect(authUrl);
    } else {
      throw new Error("Invalid provider type");
    }
    */
    const actionMetadata = getLoginActionMetadata(provider, service);

    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <AuthAction
          actionMetadata={actionMetadata}
          authUrl={authUrl}
          agentName={agentName}
        />
      </div>
    );
  }
}
