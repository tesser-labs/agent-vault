#!/usr/bin/env node

import { McpGateway } from "./gateway";
import { GatewayServer } from "./gatewayServer";
import { GatewayRouter } from "./gatewayRouter";
import { logger } from "./utility/logger";
import { loadProviderConfigs } from "./config/configLoader";

async function main() {
  try {
    // Load provider configurations from the config file
    const providersConfig = loadProviderConfigs(
      "/Users/hra/Workspace/Code/tesser/secure-mcp/packages/mcp-gw/src/config/providers.json"
    );
    logger.info(JSON.stringify(providersConfig, null, 2));
    const server = new GatewayServer();
    const router = new GatewayRouter();
    // Create gateway instance
    const gateway = new McpGateway(router, server);

    // Handle SIGINT
    process.on("SIGINT", async () => {
      try {
        await gateway.stop();
        logger.info("Gateway stopped gracefully");
        logger.flushLogsAndExit(0);
      } catch (error) {
        logger.error("Error stopping gateway", { error });
        logger.flushLogsAndExit(1);
      }
    });

    // Create proxy instance with logging hooks
    await gateway.start(providersConfig);
    logger.info(
      "Gateway started successfully with loaded provider configurations"
    );
  } catch (error) {
    console.error(error);
    logger.error("Error starting gateway");
    logger.flushLogsAndExit(1);
  }
}

main().catch((error) => {
  console.error(error);
  logger.error("Fatal error in main", { error });
  logger.flushLogsAndExit(1);
});
