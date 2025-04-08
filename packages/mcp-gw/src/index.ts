import { server } from "./server";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.info("MCP gateway running on stdio");
}

main().catch((error) => {
  console.error(`Error starting MCP gateway: ${error}`);
  process.exit(1);
});
