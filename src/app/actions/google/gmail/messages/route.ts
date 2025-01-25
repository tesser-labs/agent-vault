import type { NextRequest } from "next/server";
import { google } from "googleapis";
import { getTokenStorageKey } from "@/cache/session";
import tokenStore from "@/cache/token";

const PROVIDER = "google";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const udid = searchParams.get("udid");
    if (!udid) {
      return new Response(JSON.stringify({ error: "udid is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    // check if user already has a token
    const tokenStorageKey = getTokenStorageKey(udid as string, PROVIDER);
    const tokens = tokenStore.get(tokenStorageKey);
    if (!tokens || !tokens.access_token) {
      return new Response(JSON.stringify({ error: "No access token found" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
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
      return new Response(JSON.stringify({ error: "Invalid Credentials" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
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
