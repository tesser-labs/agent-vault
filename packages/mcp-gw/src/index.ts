#!/usr/bin/env node

import { Command } from "commander";
import { serverCommands } from "./cli/commands/server";
import { workspaceCommands } from "./cli/commands/workspace";
import { runCommand } from "./cli/commands/run";

const program = new Command();

program.name("mcp-gateway").description("MCP Gateway CLI").version("1.0.0");

// Add server commands
serverCommands(program);

// Add workspace commands
workspaceCommands(program);

// Add run command
runCommand(program);

program.parse(process.argv);
