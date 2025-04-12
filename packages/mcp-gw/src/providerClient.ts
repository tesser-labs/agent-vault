import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type { Namespace } from "./utility/namespace.js";
import { SERVER_NAME, SERVER_VERSION } from "./config.js";

export interface BaseProviderConfig {
  type: string; // discriminator field
}

interface StdioProviderConfig extends BaseProviderConfig {
  type: "stdio";
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

interface SSEProviderConfig extends BaseProviderConfig {
  type: "sse";
  url: string;
}

type ProviderParameters = StdioProviderConfig | SSEProviderConfig;

interface McpProviderConfig {
  namespace: Namespace;
  providerParameters: ProviderParameters;
}

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
export type { McpProviderConfig, ProviderParameters };
