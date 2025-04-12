#!/usr/bin/env node

import { McpGateway } from "./gateway";
import { GatewayServer } from "./gatewayServer";
import { GatewayRouter } from "./gatewayRouter";
import type { McpProviderConfig } from "./providerClient";
import { logger } from "./utility/logger";

async function main() {
  const providersConfig: McpProviderConfig[] = [
    {
      namespace: "weather1",
      providerParameters: {
        type: "stdio",
        command: "/Users/hra/.local/bin/uv",
        args: [
          "--directory",
          "/Users/hra/Workspace/Code/agent-playground/MCP/server/weather",
          "run",
          "weather.py",
        ],
      },
    },
    {
      namespace: "weather2",
      providerParameters: {
        type: "stdio",
        command: "/Users/hra/.local/bin/uv",
        args: [
          "--directory",
          "/Users/hra/Workspace/Code/agent-playground/MCP/server/weather",
          "run",
          "weather.py",
        ],
      },
    },
    {
      namespace: "weather3",
      providerParameters: {
        type: "stdio",
        command: "/Users/hra/.local/bin/uv",
        args: [
          "--directory",
          "/Users/hra/Workspace/Code/agent-playground/MCP/server/weather",
          "run",
          "weather.py",
        ],
      },
    },
    {
      namespace: "weather4",
      providerParameters: {
        type: "stdio",
        command: "/Users/hra/.local/bin/uv",
        args: [
          "--directory",
          "/Users/hra/Workspace/Code/agent-playground/MCP/server/weather",
          "run",
          "weather.py",
        ],
      },
    },
    {
      namespace: "weather5",
      providerParameters: {
        type: "stdio",
        command: "/Users/hra/.local/bin/uv",
        args: [
          "--directory",
          "/Users/hra/Workspace/Code/agent-playground/MCP/server/weather",
          "run",
          "weather.py",
        ],
      },
    },
    {
      namespace: "weather6",
      providerParameters: {
        type: "stdio",
        command: "/Users/hra/.local/bin/uv",
        args: [
          "--directory",
          "/Users/hra/Workspace/Code/agent-playground/MCP/server/weather",
          "run",
          "weather.py",
        ],
      },
    },
    {
      namespace: "weather7",
      providerParameters: {
        type: "stdio",
        command: "/Users/hra/.local/bin/uv",
        args: [
          "--directory",
          "/Users/hra/Workspace/Code/agent-playground/MCP/server/weather",
          "run",
          "weather.py",
        ],
      },
    },
    {
      namespace: "weather8",
      providerParameters: {
        type: "stdio",
        command: "/Users/hra/.local/bin/uv",
        args: [
          "--directory",
          "/Users/hra/Workspace/Code/agent-playground/MCP/server/weather",
          "run",
          "weather.py",
        ],
      },
    },
  ];

  const server = new GatewayServer();
  const router = new GatewayRouter();
  // Create gateway instance
  const gateway = new McpGateway(router, server);

  // Handle SIGINT
  process.on("SIGINT", async () => {
    try {
      await gateway.stop();
      logger.info("Gateway stopped gracefully");
      process.exit(0);
    } catch (error) {
      logger.error("Error stopping gateway", { error });
      process.exit(1);
    }
  });

  // Create proxy instance with logging hooks
  await gateway.start(providersConfig);
}

main().catch((error) => {
  logger.error("Fatal error in main", { error });
  process.exit(1);
});
