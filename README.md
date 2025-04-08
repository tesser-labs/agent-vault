### Arch

graph TD
LLM --> MPCClient
MPCClient --> MPCGateway
MPCGateway --> Tool1[tool]
MPCGateway --> Tool2[tool]
MPCGateway --> AgentVault

    AgentVault --> Resource1[Resource 1]
    AgentVault --> Resource2[Resource 2]
    AgentVault --> Keystore
    Keystore --> AgentVault

    AgentOauth --> AgentVault
    AgentOauth --> MPCClient

    subgraph Local Environment
        MPCClient
        MPCGateway
        Tool1
        Tool2
        AgentVault
        Keystore
    end
