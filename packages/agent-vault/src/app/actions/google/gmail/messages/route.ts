export const maxDuration = 60;

import type { NextRequest } from "next/server";
import { google } from "googleapis";
import { getTokenStorageKey } from "@/cache/session";
import tokenStore from "@/cache/token";
import { getAuthEndpoint } from "@/authProviders";
import { UnAuthorizedResponse } from "@/app/responses";

const toolMetadata = { provider: "google", service: "gmail" };

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    // agent did
    const adid = searchParams.get("adid") || undefined;
    const resource = searchParams.get("resource") || undefined;
    /* if (!udid) {
      return new Response(JSON.stringify({ error: "udid is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } */
    // check if user already has a token
    // TODO: add agent authentication to retrieve Agent ID and name
    const agentName = adid;
    const tokenStorageKey = getTokenStorageKey({
      agentName,
      provider: toolMetadata.provider,
      resource,
      service: toolMetadata.service,
    });
    const tokens = await tokenStore.get(tokenStorageKey);
    if (
      !tokens ||
      !tokens.access_token ||
      (tokens.expiry_date && tokens.expiry_date < Date.now())
    ) {
      console.log("No tokens found for", tokenStorageKey, "tokens:", tokens);
      const authEndpoint = getAuthEndpoint({
        provider: toolMetadata.provider,
      }).toString();
      return new UnAuthorizedResponse({ authEndpoint });
    }

    const maxResults = searchParams.get("limit") || 10;
    const oauth2Client = new google.auth.OAuth2();
    const { access_token } = tokens;
    oauth2Client.setCredentials({ access_token });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const response = await gmail.users.messages.list({
      userId: "me",
      maxResults: parseInt(maxResults as string, 10),
    });

    const messages = response.data.messages || [];

    const emails = await Promise.all(
      messages
        .filter((message) => message?.id)
        .map(async (message) => {
          const email = await gmail.users.messages.get({
            userId: "me",
            id: message.id as string,
          });
          const { payload, snippet } = email?.data || {};
          return { payload, snippet };
        })
    );
    return new Response(JSON.stringify(emails), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error retrieving emails:", error);
    if ((error as { status: number })?.status === 401) {
      const authEndpoint = getAuthEndpoint({
        provider: toolMetadata.provider,
      }).toString();
      return new UnAuthorizedResponse({ authEndpoint });
    }
    return new Response(
      JSON.stringify({ error: "Failed to retrieve emails" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
