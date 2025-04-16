import { Command } from "commander";
import prompts from "prompts";
import {
  addWorkspace,
  removeWorkspace,
  getWorkspaces,
} from "../../config/configStore";
import { loadProvidersMap } from "../../config/configLoader";

export function workspaceCommands(program: Command) {
  const workspace = program
    .command("workspace")
    .description("Manage MCP workspaces");

  workspace
    .command("create")
    .description("Create a new workspace")
    .argument("<workspace-name>", "name of the workspace")
    .action(async (name) => {
      console.log(`Creating workspace: ${name}`);

      const providers = loadProvidersMap();
      const providerChoices = Object.entries(providers).map(([key]) => ({
        title: key,
        value: key,
      }));

      if (providerChoices.length === 0) {
        console.error("No providers found. Please add providers first.");
        return;
      }

      const response = await prompts({
        type: "multiselect",
        name: "providers",
        message: "Select providers for this workspace",
        choices: providerChoices,
        min: 1,
      });

      if (!response.providers) {
        console.log("Operation cancelled");
        return;
      }

      addWorkspace(name, response.providers);
      console.log(
        `✔ Workspace "${name}" created successfully with ${response.providers.length} providers`
      );
    });

  workspace
    .command("list")
    .description("List all available workspaces")
    .action(async () => {
      const workspaces = getWorkspaces();
      const workspaceCount = Object.keys(workspaces).length;

      if (workspaceCount === 0) {
        console.log("No workspaces found");
        return;
      }

      console.log(`Found ${workspaceCount} workspace(s):`);

      for (const [name, providers] of Object.entries(workspaces)) {
        console.log(`\n${name}`);
        console.log("Providers:");
        providers.forEach((provider) => {
          console.log(`  • ${provider}`);
        });
      }
    });

  workspace
    .command("delete")
    .description("Delete a workspace")
    .argument("<workspace-name>", "name of the workspace to delete")
    .action(async (name) => {
      const workspaces = getWorkspaces();

      if (!workspaces[name]) {
        console.error(`Workspace "${name}" not found`);
        return;
      }

      const response = await prompts({
        type: "confirm",
        name: "value",
        message: `Are you sure you want to delete workspace "${name}"?`,
        initial: false,
      });

      if (!response.value) {
        console.log("Operation cancelled");
        return;
      }

      removeWorkspace(name);
      console.log(`✔ Workspace "${name}" deleted successfully`);
    });

  workspace
    .command("remove-server")
    .description("Remove a server from a workspace")
    .argument("<workspace-name>", "name of the workspace")
    .argument("<server-name>", "name of the server to remove")
    .action(async (workspaceName, serverName) => {
      const workspaces = getWorkspaces();

      if (!workspaces[workspaceName]) {
        console.error(`Workspace "${workspaceName}" not found`);
        return;
      }

      const providers = workspaces[workspaceName];
      if (!providers.includes(serverName)) {
        console.error(
          `Server "${serverName}" not found in workspace "${workspaceName}"`
        );
        return;
      }

      const response = await prompts({
        type: "confirm",
        name: "value",
        message: `Are you sure you want to remove server "${serverName}" from workspace "${workspaceName}"?`,
        initial: false,
      });

      if (!response.value) {
        console.log("Operation cancelled");
        return;
      }

      const updatedProviders = providers.filter((p) => p !== serverName);
      addWorkspace(workspaceName, updatedProviders);
      console.log(
        `✔ Server "${serverName}" removed from workspace "${workspaceName}"`
      );
    });

  return workspace;
}
