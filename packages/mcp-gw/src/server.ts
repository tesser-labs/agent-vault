import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getEmailTool } from "./tools/gmail";
import { getShopifyProductsTool } from "./tools/shopify";
import { getShopifyProductsSchema, getEmailSchema } from "./tools/schema";

const server = new McpServer({
  name: "mcp-gw",
  version: "0.1.0",
  capabilities: { tools: {} },
});

server.tool(
  "get_email_tool",
  `This tool is used to fetch the user's email from gmail.`,
  getEmailSchema,
  getEmailTool
);

server.tool(
  "get_shopify_products",
  `This tool is used to fetch the user's products from their Shopify store.`,
  getShopifyProductsSchema,
  getShopifyProductsTool
);

export { server };
