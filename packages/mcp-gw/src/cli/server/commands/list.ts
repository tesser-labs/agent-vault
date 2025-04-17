import chalk from "chalk";
import {
  McpProvider,
  isStdioConfig,
  isSSEConfig,
} from "../../../config/schema";

export function printProviders(providers: McpProvider[]) {
  if (providers.length === 0) {
    console.log(chalk.yellow("No MCP providers configured"));
    return;
  }

  console.log(chalk.bold("\nConfigured MCP Providers:"));
  console.log(chalk.dim("----------------------"));

  providers.forEach((provider) => {
    console.log(chalk.bold(`\nName: ${provider.namespace}`));
    console.log(chalk.cyan(`Type: ${provider.type}`));

    if (isStdioConfig(provider)) {
      console.log(`Command: ${provider.providerParameters.command}`);
      if (provider.providerParameters.args?.length) {
        console.log(`Args: ${provider.providerParameters.args.join(" ")}`);
      }
      const envVars = provider.providerParameters.env;
      if (Object.keys(envVars || {}).length > 0) {
        console.log("Environment Variables:");
        Object.entries(envVars || {}).forEach(([key, value]) => {
          console.log(chalk.dim(`  ${key}=${value}`));
        });
      }
    } else if (isSSEConfig(provider)) {
      console.log(`URL: ${provider.providerParameters.url}`);
    }
  });
  console.log("\n");
}
