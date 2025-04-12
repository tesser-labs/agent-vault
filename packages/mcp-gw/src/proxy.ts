import { Server as McpServer } from "@modelcontextprotocol/sdk/server/index.js";
import { Client as McpClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  CallToolResultSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  GetPromptResultSchema,
  ListToolsResult,
  CallToolResult,
  ListPromptsResult,
  GetPromptResult,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

import { CallToolRequest } from "@modelcontextprotocol/sdk/types";
import { GetPromptRequest } from "@modelcontextprotocol/sdk/types";
import { logger } from "./logger";

const SERVER_NAME = "tesser_mcp_gateway";
const SERVER_VERSION = "1.0.0";

export interface GatewayHook {
  onMessage?: (
    message: any,
    direction: "client-to-server" | "server-to-client"
  ) => void;
  onError?: (error: Error) => void;
}

async function createMcpClient(
  transport: StdioClientTransport | SSEClientTransport
) {
  const client = new McpClient({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });
  await client.connect(transport);

  return client;
}

class GatewayServer {
  mcpServer: McpServer;
  transport: StdioServerTransport;
  constructor() {
    this.mcpServer = new McpServer({
      name: SERVER_NAME,
      version: SERVER_VERSION,
    });
    this.transport = new StdioServerTransport();
  }
  async start() {
    this.mcpServer.connect(this.transport);
  }
  async stop() {
    if (this.mcpServer) {
      await this.mcpServer.close();
    }
  }
}

// Namespace
type Namespace = string;
type NamespacedName = `${Namespace}_${string}`;
function isNamespacedName(name: string): name is NamespacedName {
  return name.includes("_");
}
function addNamespace(namespace: Namespace, name: string): NamespacedName {
  return `${namespace}_${name}`;
}
function parseNamespace(namespacedName: NamespacedName) {
  const [namespace, ...name] = namespacedName.split("_");
  return { namespace, name: name.join("_") };
}

interface BaseServerConfig {
  type: string; // discriminator field
}

interface StdioServerConfig extends BaseServerConfig {
  type: "stdio";
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
}

interface SSEServerConfig extends BaseServerConfig {
  type: "sse";
  url: string;
}

type ServerParameters = StdioServerConfig | SSEServerConfig;

interface McpProviderConfig {
  namespace: Namespace;
  serverParameters: ServerParameters;
}

function getMcpServerTransport(serverParameters: ServerParameters) {
  switch (serverParameters.type) {
    case "stdio": {
      return new StdioClientTransport(serverParameters);
    }
    case "sse":
      return new SSEClientTransport(new URL(serverParameters.url));
    default:
      throw new Error(
        `Unsupported server type: ${(serverParameters as any).type}`
      );
  }
}

class GatewayRouter {
  providers?: Map<Namespace, McpClient>;

  // Connect to MCP providers
  async connect(providersConfig: McpProviderConfig[]) {
    this.providers = new Map();
    // iterate and connect  MCP providers
    const providerPromises = [];
    for (const providerConfig of providersConfig) {
      const { namespace, serverParameters } = providerConfig;
      const transport = getMcpServerTransport(serverParameters);
      const providerPromise = createMcpClient(transport).then((provider) => ({
        namespace,
        provider,
      }));
      providerPromises.push(providerPromise);
    }
    const providers = await Promise.all(providerPromises);
    for (const { namespace, provider } of providers) {
      this.providers.set(namespace, provider);
    }
  }

  // List & Index MCP tools
  async listTools() {
    if (!this.providers) {
      throw new Error("Providers not connected");
    }
    const toolList = [];
    // Iterate over all providers and index their tools
    for (const [namespace, provider] of this.providers.entries()) {
      const capabilities = await provider.getServerCapabilities();
      if (capabilities?.tools) {
        const { tools } = await provider.listTools();
        logger.logMessage({
          level: "info",
          data: tools,
        });
        // transform tool names to include namespace
        const namespaceTools = tools.map((tool) => ({
          ...tool,
          // Serialize tool name to include namespace
          name: addNamespace(namespace, tool.name),
        }));

        toolList.push(...namespaceTools);
      }
    }
    return toolList;
  }

  // List & Index MCP prompts
  async listPrompts() {
    if (!this.providers) {
      throw new Error("Providers not connected");
    }
    const promptList = [];
    // Iterate over all providers and index their prompts
    for (const [namespace, provider] of this.providers.entries()) {
      const capabilities = await provider.getServerCapabilities();
      if (capabilities?.prompts) {
        const { prompts } = await provider.listPrompts();
        const namespacePrompts = prompts.map((prompt) => ({
          ...prompt,
          // Serialize prompt name to include namespace
          name: addNamespace(namespace, prompt.name),
        }));

        promptList.push(...namespacePrompts);
      }
    }
    return promptList;
  }

  async routeToolRequest(request: CallToolRequest) {
    const { name } = request.params;
    if (!isNamespacedName(name)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid tool name. Missing namespace."
      );
    }
    const { namespace, name: toolName } = parseNamespace(name);
    // get the provider for the namespace
    const provider = this.providers?.get(namespace);
    if (!provider) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Provider ${namespace} not found`
      );
    }

    // set the tool name to the tool name without the namespace before routing the request
    request.params.name = toolName;

    // route the request to the provider
    return await provider.request(request, CallToolResultSchema);
  }

  async routePromptRequest(request: GetPromptRequest) {
    const { name } = request.params;
    if (!isNamespacedName(name)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        "Invalid prompt name. Missing namespace."
      );
    }
    const { namespace, name: promptName } = parseNamespace(name);
    // get the provider for the namespace
    const provider = this.providers?.get(namespace);
    if (!provider) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Provider ${namespace} not found`
      );
    }

    // set the  name to the prompt name without the namespace before routing the request
    request.params.name = promptName;

    // route the request to the provider
    return await provider.request(request, GetPromptResultSchema);
  }

  async start(providersConfig: McpProviderConfig[]) {
    await this.connect(providersConfig);
  }

  async stop() {
    if (this.providers) {
      // close all providers
      await Promise.all(
        Array.from(this.providers.values()).map((provider) => provider.close())
      );
      this.providers = undefined;
    }
  }
}

class McpGateway {
  private server: GatewayServer;
  private router: GatewayRouter;
  private isStarted = false;

  private _toolHandlersInitialized = false;
  private setToolRequestHandler() {
    const mcpServer = this.server.mcpServer;

    if (this._toolHandlersInitialized) {
      return;
    }

    if (!mcpServer) {
      throw new Error("GatewayServer not started");
    }

    // assert the handlers are not already set
    mcpServer.assertCanSetRequestHandler(
      ListToolsRequestSchema.shape.method.value
    );
    mcpServer.assertCanSetRequestHandler(
      CallToolRequestSchema.shape.method.value
    );

    mcpServer.registerCapabilities({
      tools: {
        listChanged: true,
      },
    });

    // set list tools handler
    mcpServer.setRequestHandler(
      ListToolsRequestSchema,
      async (request): Promise<ListToolsResult> => {
        logger.logMessage({
          level: "info",
          data: request,
        });
        const tools = await this.router.listTools();
        logger.logMessage({
          level: "info",
          data: tools,
        });
        return {
          tools,
        };
      }
    );

    // set call tool handler
    mcpServer.setRequestHandler(
      CallToolRequestSchema,
      async (request): Promise<CallToolResult> => {
        logger.logMessage({
          level: "info",
          data: request,
        });
        return await this.router.routeToolRequest(request);
      }
    );
  }

  private _promptHandlersInitialized = false;
  private setPromptRequestHandler() {
    const mcpServer = this.server.mcpServer;

    if (this._promptHandlersInitialized) {
      return;
    }

    if (!mcpServer) {
      throw new Error("GatewayServer not started");
    }

    // assert the handlers are not already set
    mcpServer.assertCanSetRequestHandler(
      ListPromptsRequestSchema.shape.method.value
    );

    mcpServer.registerCapabilities({
      prompts: {
        listChanged: true,
      },
    });

    // set list prompts handler
    mcpServer.setRequestHandler(
      ListPromptsRequestSchema,
      async (): Promise<ListPromptsResult> => ({
        prompts: await this.router.listPrompts(),
      })
    );

    // set get prompt handler
    mcpServer.setRequestHandler(
      GetPromptRequestSchema,
      async (request): Promise<GetPromptResult> => {
        return await this.router.routePromptRequest(request);
      }
    );
  }

  // TODO: implement support for resources
  /*
  private _resourceHandlersInitialized = false;
  private setResourceRequestHandler() {} // TODO: implement support for resources
  */

  constructor(router: GatewayRouter, server: GatewayServer) {
    this.server = server;
    this.router = router;
  }

  async start(providersConfig: McpProviderConfig[]) {
    // first set the handlers. This should be done before starting the server and router
    this.setToolRequestHandler();
    this.setPromptRequestHandler();

    this.sendLoggingMessage({
      level: "info",
      data: "MCP Gateway started...",
    });

    // start the gateway server and router
    await this.router.start(providersConfig);
    await this.server.start();

    this.sendLoggingMessage({
      level: "info",
      data: "Listening for client connections on stdio",
    });

    this.isStarted = true;
  }

  async sendLoggingMessage(log: { level: "info" | "error"; data: string }) {
    if (this.isStarted) {
      this.server.mcpServer.sendLoggingMessage(log);
    }
    logger.logMessage(log);
  }

  async stop() {
    if (!this.isStarted) {
      return;
    }
    // send a logging message to the client
    this.sendLoggingMessage({
      level: "info",
      data: "Shutting down gateway...",
    });
    // stop the gateway server and router
    await Promise.all([this.router.stop(), this.server.stop()]);
    this.isStarted = false;
  }
}

export { McpGateway, GatewayServer, GatewayRouter, McpProviderConfig };
