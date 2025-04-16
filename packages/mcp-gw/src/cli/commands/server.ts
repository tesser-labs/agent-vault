import { Command } from "commander";
import { McpProvider } from "../../config/schema";
import {
  addMcpProviders,
  getMcpProviders,
  removeMcpProvider,
} from "../../config/configStore";
import { isStdioConfig, isSSEConfig } from "../../config/schema";
import { loadProviderConfigFile } from "../../config/configLoader";

function parseProviderParameters(
  name: string,
  options: { command?: string; env?: string[]; url?: string }
): McpProvider {
  if (options.url) {
    return {
      type: "sse",
      namespace: name,
      providerParameters: {
        url: options.url,
      },
    };
  }

  if (options.command) {
    // Split command into command and args, handling quoted arguments
    const parts = options.command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const command = parts[0];
    if (!command) {
      throw new Error("Command is missing");
    }
    const args = parts.slice(1).map((arg) => arg.replace(/^"(.*)"$/, "$1"));

    const envVars: Record<string, string> = {};
    if (options.env) {
      for (const envPair of options.env) {
        const [key, value] = envPair.split("=");
        if (key && value) {
          envVars[key] = value;
        }
      }
    }

    return {
      type: "stdio",
      namespace: name,
      providerParameters: {
        command,
        args,
        env: envVars,
      },
    };
  }

  throw new Error("Either command or url must be provided");
}

function printProviders(providers: McpProvider[]) {
  if (providers.length === 0) {
    console.log("No MCP servers configured");
    return;
  }

  console.log("\nConfigured MCP Servers:");
  console.log("----------------------");

  providers.forEach((provider) => {
    console.log(`\nName: ${provider.namespace}`);
    console.log(`Type: ${provider.type}`);

    if (isStdioConfig(provider)) {
      console.log(`Command: ${provider.providerParameters.command}`);
      if (provider.providerParameters.args?.length) {
        console.log(`Args: ${provider.providerParameters.args.join(" ")}`);
      }
      const envVars = provider.providerParameters.env;
      if (Object.keys(envVars || {}).length > 0) {
        console.log("Environment Variables:");
        Object.entries(envVars || {}).forEach(([key, value]) => {
          console.log(`  ${key}=${value}`);
        });
      }
    } else if (isSSEConfig(provider)) {
      console.log(`URL: ${provider.providerParameters.url}`);
    }
  });
  console.log("\n");
}

function importAction(options: { config: string }) {
  const providers = loadProviderConfigFile(options.config);
  addMcpProviders(providers);
}

export function serverCommands(program: Command) {
  const server = program.command("server").description("Manage MCP servers");

  server
    .command("add")
    .description("Add a new MCP server (local or remote)")
    .argument("<name>", "name of the server")
    .option("--command <command>", "command to run the server")
    .option(
      "--env [env...]",
      "environment variables for the command (key=value pairs)"
    )
    .option("--url <url>", "URL for the server")
    .action((name, options) => {
      const mcpProviderConfig = parseProviderParameters(name, options);
      addMcpProviders([mcpProviderConfig]);
    });

  server
    .command("list")
    .description("List all added MCP servers")
    .action(() => {
      console.log("Listing servers");
      const providersMap = getMcpProviders();
      const providers = Object.values(providersMap);
      printProviders(providers);
    });

  server
    .command("remove")
    .description("Remove a server")
    .argument("<name>", "name of the server to remove")
    .action((name) => {
      console.log("Removing server:", name);
      removeMcpProvider(name);
    });

  server
    .command("import")
    .description("Import configuration from a file")
    .option("--config <path>", "path to the config file")
    .action((options) => {
      console.log("Importing config from:", options.config);
      importAction(options);
    });

  return server;
}
