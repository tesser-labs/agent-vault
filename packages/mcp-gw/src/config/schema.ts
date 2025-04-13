import { z } from "zod";

// Define the Zod schema for provider parameters
const StdioProviderSchema = z.object({
  type: z.literal("stdio"),
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  cwd: z.string().optional(),
});

const SSEProviderSchema = z.object({
  type: z.literal("sse"),
  url: z.string().url("Invalid URL format"),
});

// Union type for provider parameters matching ProviderParameters type
const ProviderParametersSchema = z.discriminatedUnion("type", [
  StdioProviderSchema,
  SSEProviderSchema,
]);

// Define the Zod schema for a single provider
const ProviderSchema = z.object({
  namespace: z.string().min(1, "Namespace cannot be empty"),
  providerParameters: ProviderParametersSchema,
});

// Define the Zod schema for the entire config file
const ConfigSchema = z.object({
  providers: z.array(ProviderSchema),
});

// Type inference from the Zod schema
type ProviderParameters = z.infer<typeof ProviderParametersSchema>;
type McpProviderConfig = z.infer<typeof ProviderSchema>;

export { ConfigSchema };
export type { McpProviderConfig, ProviderParameters };
