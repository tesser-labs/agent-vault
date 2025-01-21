import { authProviders } from "@/providers";
import tokenStore from "@/cache/token";
import sessionStore from "@/cache/session";
import { redirect } from "next/navigation";
import { getTokenStorageKey } from "@/cache/session";

export default async function callbackHandler({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ code: string; state: string }>;
}) {
  console.log([...tokenStore.keys()]);
  const { code, state } = await searchParams;

  // get resource from dynamic path slug
  const { resource } = await params;

  // take the pending auth session from the store
  const authSession = sessionStore.take(state);

  const { udid, redirectUrl } = authSession || {};

  if (!udid || !redirectUrl) {
    throw new Error("Invalid state");
  }

  // retrieve the provider
  const provider = authProviders[resource];
  if (!provider) {
    throw new Error(`Invalid resource. ${resource} is not supported`);
  }

  // exchange the code for tokens
  const tokens = await provider.getAccessToken(code);

  const url = new URL(redirectUrl);

  // store the tokens
  if (tokens) {
    const { access_token, refresh_token, expiry_date } = tokens;

    const key = getTokenStorageKey(udid, resource);
    console.log("stored under key", key);
    tokenStore.set(key, { access_token, refresh_token, expiry_date });
    console.log("after:", [...tokenStore.keys()]);
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
