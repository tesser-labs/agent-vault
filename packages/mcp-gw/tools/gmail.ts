import { tool } from "@langchain/core/tools";
import { getEmailSchema } from "./schema";
import { getAuthURL } from "./utils/auth";

const { ACTION_API_ENDPOINT, DID } = process.env;

if (!DID || !ACTION_API_ENDPOINT) {
  throw new Error("DID or ACTION_API_ENDPOINT is not set");
}

export const emailTool = tool(
  async ({ limit }) => {
    const authEndpointURL = getAuthURL({ provider: "google", udid: DID });
    const authAction = {
      url: authEndpointURL.toString(),
      metadata: {
        title: "Login to Gmail",
        name: "gmail",
        description:
          "login to your gmail account to allow access to your gmail box, so I can fetch your emails for you",
        logo: "https://lh3.googleusercontent.com/0rpHlrX8IG77awQMuUZpQ0zGWT7HRYtpncsuRnFo6V3c8Lh2hPjXnEuhDDd-OsLz1vua4ld2rlUYFAaBYk-rZCODmi2eJlwUEVsZgg",
        btnText: "Login to Gmail",
      },
    };

    // Action Endpoint URL
    const actionEndpointURL = new URL(
      "google/gmail/messages",
      ACTION_API_ENDPOINT,
    );

    const agentDID = DID;
    actionEndpointURL.searchParams.set("limit", limit.toString());
    actionEndpointURL.searchParams.set("udid", agentDID as string);
    const response = await fetch(actionEndpointURL);
    if (response.status === 401) {
      return { humanAction: authAction };
    } else if (response.status < 300) {
      const data = await response.json();
      console.info(data);
      return JSON.stringify(
        data.map((email: any, i: number) => ({
          index: i,
          snippent: email.snippet,
        })),
      );
    } else {
      console.error(response);
      return {
        error: "Something went wrong",
      };
    }
  },
  {
    name: "get_email_tool",
    description: `This tool is used to fetch the user's email from gmail.`,
    schema: getEmailSchema,
  },
);
