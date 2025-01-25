import { authProviders } from "@/providers";
import tokenStore from "@/cache/token";
import sessionStore from "@/cache/session";
import { redirect } from "next/navigation";
import { getTokenStorageKey } from "@/cache/session";

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
  const authSession = sessionStore.take(state);

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
    const { access_token, refresh_token, expiry_date } = tokens;

    const key = getTokenStorageKey(udid, provider, resource);
    tokenStore.set(key, { access_token, refresh_token, expiry_date });
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
