import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { SERVER_NAME, SERVER_VERSION } from "./config.js";
import { ProviderParameters } from "./config/schema.js";

function getProviderClientTransport(providerParameters: ProviderParameters) {
  switch (providerParameters.type) {
    case "stdio": {
      return new StdioClientTransport(providerParameters);
    }
    case "sse":
      return new SSEClientTransport(new URL(providerParameters.url));
    default:
      throw new Error(
        `Unsupported provider type: ${(providerParameters as any).type}`
      );
  }
}

async function createProviderClient(
  transport: StdioClientTransport | SSEClientTransport
) {
  const client = new McpClient({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });
  await client.connect(transport);

  return client;
}

export { createProviderClient, getProviderClientTransport };
