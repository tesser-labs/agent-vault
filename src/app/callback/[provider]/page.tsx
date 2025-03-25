import { authProviders } from "@/authProviders";
import tokenStore from "@/cache/token";
import sessionStore from "@/cache/session";
import { redirect } from "next/navigation";
import { getTokenStorageKey } from "@/cache/session";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TOKEN_EXPIRY_TIME = Number(process.env.TOKEN_EXPIRY_TIME) || undefined;

export default async function callbackHandler({
  params,
  searchParams,
}: {
  params: Promise<{ provider: string }>;
  searchParams: Promise<{ code: string; state: string }>;
}) {
  const { code, state } = await searchParams;

  // get provider name from dynamic path slug
  const { provider } = await params;

  // take the pending auth session from the store
  const session = await sessionStore.take(state);
  if (!session) throw new Error("No session found");

  const { redirectUrl, context } = session;
  const {
    user,
    provider: providerInSession,
    resource,
    service,
    agent,
  } = context;

  if (!redirectUrl || providerInSession !== provider) {
    throw new Error("Invalid state");
  }

  // retrieve the provider
  const authProvider = authProviders[provider];
  if (!authProvider) {
    throw new Error(`Invalid provider. ${provider} is not supported`);
  }

  // exchange the code for tokens
  const tokens = await authProvider.getAccessToken(code, {
    resource,
  });

  const url = new URL(decodeURIComponent(redirectUrl));

  // store the tokens
  if (tokens) {
    const { access_token, refresh_token, expiry_date } = tokens;
    // override expiry date if TOKEN_EXPIRY_TIME is set
    // expiry_date = TOKEN_EXPIRY_TIME
    //   ? Math.floor(Date.now() + TOKEN_EXPIRY_TIME * 1000)
    //   : expiry_date;
    const key = getTokenStorageKey({
      agentName: agent?.name,
      provider,
      resource,
    });
    await tokenStore.set(key, {
      provider,
      resource,
      ...(agent && { agent }),
      ...(user && { user }),
      ...(service && { service }),
      access_token,
      refresh_token,
      expiry_date,
    });
    url.searchParams.set("result", "success");
  } else {
    url.searchParams.set("result", "error");
  }
  redirect(url.toString());

  return (
    <div>
      <h1>processing ...</h1>
    </div>
  );
}
