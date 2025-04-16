import {
  loadProvidersMap,
  loadWorkspaceMap,
  saveProviders,
  saveWorkspaceMap,
} from "./configLoader";
import type { McpProvider } from "./schema";

export function addMcpProviders(providers: McpProvider[]) {
  // append the providers to the config file
  const config = loadProvidersMap();

  // index the providers by namespace
  const newProviders = providers.reduce((acc, provider) => {
    acc[provider.namespace] = provider;
    return acc;
  }, {} as Record<string, McpProvider>);

  // save the new config
  saveProviders({ ...config, ...newProviders });
}

export function removeMcpProvider(name: string) {
  let config = loadProvidersMap();
  delete config[name];
  saveProviders(config);
}

export function getMcpProviders() {
  const config = loadProvidersMap();
  return config;
}

export function addWorkspace(name: string, providerNames: string[]) {
  let config = loadWorkspaceMap();
  config = { ...config, [name]: providerNames };
  saveWorkspaceMap(config);
}

export function removeWorkspace(name: string) {
  let config = loadWorkspaceMap();
  delete config[name];
  saveWorkspaceMap(config);
}

export function getWorkspaces() {
  const config = loadWorkspaceMap();
  return config;
}
