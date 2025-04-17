import { McpProvider } from "../../../store/schema";

export function parseProviderParameters(
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
