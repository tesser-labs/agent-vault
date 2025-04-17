import chalk from "chalk";
import boxen from "boxen";

export function listWorkspace(
  workspaces: Record<string, string[]>,
  name?: string
) {
  const workspaceCount = Object.keys(workspaces).length;

  if (workspaceCount === 0) {
    console.log(
      boxen(chalk.yellow("No workspaces found"), {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "yellow",
      })
    );
    return;
  }

  // If a specific workspace is requested
  if (name) {
    const workspace = workspaces[name];
    if (!workspace) {
      console.log(
        boxen(chalk.red(`Workspace "${name}" not found`), {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "red",
        })
      );
      return;
    }

    // Display single workspace
    console.log(
      boxen(
        chalk.bold(`Workspace: ${chalk.green(name)}\n\n`) +
          chalk.bold(`Providers (${workspace.length}):\n`) +
          workspace
            .map((provider) => `  ${chalk.green("•")} ${provider}`)
            .join("\n"),
        {
          padding: 1,
          margin: 1,
          borderStyle: "round",
          borderColor: "green",
        }
      )
    );
    return;
  }

  // Display all workspaces
  console.log(
    boxen(
      chalk.bold.cyan(`Found ${workspaceCount} workspace(s):\n`) +
        Object.entries(workspaces)
          .map(
            ([wsName, providers]) =>
              `\n${chalk.bold(wsName)}\n` +
              chalk.dim("Providers:") +
              `\n${providers
                .map((provider) => `  ${chalk.green("•")} ${provider}`)
                .join("\n")}`
          )
          .join("\n"),
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    )
  );
}
