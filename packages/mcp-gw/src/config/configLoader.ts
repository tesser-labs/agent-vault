import fs from "fs";
import path from "path";
import type { McpProviderConfig } from "./schema";
import { ConfigSchema } from "./schema";

export function loadProviderConfigs(configPath?: string): McpProviderConfig[] {
  const defaultConfigPath = path.join(__dirname, "providers.json");
  const targetPath = configPath || defaultConfigPath;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`Config file not found at ${targetPath}`);
  }

  // check if the file access is allowed
  try {
    fs.accessSync(targetPath, fs.constants.R_OK);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Config file not accessible at ${targetPath}: ${error.message}`
      );
    }
    throw new Error(`Config file not accessible at ${targetPath}`);
  }

  const configContent = fs.readFileSync(targetPath, "utf-8");
  let jsonConfig: unknown;

  try {
    jsonConfig = JSON.parse(configContent);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Invalid JSON in config file: ${error.message}`);
    }
    throw new Error("Invalid JSON in config file");
  }

  // Validate the config against our schema
  const validatedConfig = ConfigSchema.parse(jsonConfig);

  // The schema exactly matches McpProviderConfig[], so this is safe
  return validatedConfig.providers;
}
