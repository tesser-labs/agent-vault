#!/usr/bin/env node

import { McpGateway } from "./proxy";
import { GatewayServer, GatewayRouter } from "./proxy";
import type { McpProviderConfig } from "./proxy";
import { logger } from "./logger";

async function main() {
  const providersConfig: McpProviderConfig[] = [
    {
      namespace: "weather",
      serverParameters: {
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
