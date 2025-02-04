import { authProviders } from "@/providers";
import tokenStore from "@/cache/token";
import sessionStore from "@/cache/session";
import { redirect } from "next/navigation";
import { getTokenStorageKey } from "@/cache/session";

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
  const authSession = await sessionStore.take(state);

  const {
    udid,
    redirectUrl,
    provider: providerInSession,
    resource,
  } = authSession || {};

  if (!udid || !redirectUrl || providerInSession !== provider) {
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
    let { access_token, refresh_token, expiry_date } = tokens;
    // override expiry date if TOKEN_EXPIRY_TIME is set
    expiry_date = TOKEN_EXPIRY_TIME
      ? Math.floor(Date.now() + TOKEN_EXPIRY_TIME * 1000)
      : expiry_date;
    const key = getTokenStorageKey(udid, provider, resource);
    await tokenStore.set(key, { access_token, refresh_token, expiry_date });
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
