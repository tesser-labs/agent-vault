# Agent Vault

Agent Vault is a secure storage and management system for AI agent credentials and configurations. It provides a centralized way to store and access sensitive information needed by AI agents while maintaining security best practices.

## Features

- [x] Secure storage of API keys, tokens and credentials
- [ ] Encrypted data at rest
- [ ] Fine-grained access control
- [x] Integration with MCP (Model Context Protocol) Gateway
- [x] Easy-to-use API for agent interactions

## Getting Started

To locally run the application:

```bash
git clone <this repo>
cd agent-vault
pnpm install
pnpm start
```

The application runs on port 3001 by default. If you need to run it on a different port, make sure to update the redirect URL in the [configuration file](./src/config/index.ts).
