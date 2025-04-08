#!/usr/bin/env node
import { StdioTransport } from "./transport";
import { JsonRpcProxy } from "./proxy";

async function main() {
  // Create transports for both client and server sides
  const clientTransport = new StdioTransport();
  const serverTransport = new StdioTransport();

  // Create and start the proxy
  const proxy = new JsonRpcProxy(clientTransport, serverTransport);

  try {
    await proxy.start();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
