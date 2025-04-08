import { getEmailSchema } from "./schema";
import { generateAuthURL } from "./utils/auth";
import open from "open";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import { z } from "zod";
const { ACTION_API_ENDPOINT, AGENT_DID } = process.env;

if (!AGENT_DID || !ACTION_API_ENDPOINT) {
  throw new Error("AGENT_DID or ACTION_API_ENDPOINT is not set");
}

const FALLBACK_AUTH_ENDPOINT =
  new URL(ACTION_API_ENDPOINT).hostname + "/auth/google";

type EmailParams = z.infer<ReturnType<typeof z.object<typeof getEmailSchema>>>;

export const getEmailTool = async ({
  limit,
}: EmailParams): Promise<{
  content: { type: "text"; text: string }[];
  isError?: boolean;
}> => {
  // Action Endpoint URL
  const actionUrl = new URL(`${ACTION_API_ENDPOINT}/google/gmail/messages`);
  actionUrl.searchParams.set("limit", limit.toString());
  actionUrl.searchParams.set("agent.name", AGENT_DID);

  const response = await fetch(actionUrl);
  if (response.status === 401) {
    const authEndpoint =
      response.headers.get("auth-endpoint") || FALLBACK_AUTH_ENDPOINT;
    // generate auth url
    const authUrl = generateAuthURL({
      authEndpoint,
      agentName: AGENT_DID,
      service: "gmail",
    });
    open(authUrl.toString());
    return {
      content: [
        {
          type: "text",
          text: `Please login to your gmail account to allow access to your gmail box, so I can fetch your emails for you. \n login url: ${authUrl.toString()}`,
        },
      ],
    };
  } else if (response.status < 300) {
    const data = await response.text();
    return {
      content: [{ type: "text", text: data }],
    };
  } else {
    const error = await response.text();
    console.error(error);
    return {
      content: [{ type: "text", text: error }],
      isError: true,
    };
  }
};
