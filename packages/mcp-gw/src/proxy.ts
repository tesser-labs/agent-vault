import { Transport } from "./types";
import {
  JsonRpcRequestSchema,
  JsonRpcResponseSchema,
  JsonRpcRequest,
  JsonRpcResponse,
} from "./types";

export class JsonRpcProxy {
  constructor(
    private readonly clientTransport: Transport,
    private readonly serverTransport: Transport
  ) {}

  private async handleClientToServer() {
    while (true) {
      try {
        const rawMessage = await this.clientTransport.read();
        const request = JsonRpcRequestSchema.parse(JSON.parse(rawMessage));

        // Forward the request to the server
        await this.serverTransport.write(JSON.stringify(request));

        // Wait for server response
        const rawResponse = await this.serverTransport.read();
        const response = JsonRpcResponseSchema.parse(JSON.parse(rawResponse));

        // Forward the response back to the client
        await this.clientTransport.write(JSON.stringify(response));
      } catch (error) {
        console.error("Error in client-to-server proxy:", error);

        // Send error response to client
        const errorResponse: JsonRpcResponse = {
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal error",
            data: error instanceof Error ? error.message : String(error),
          },
          id: null,
        };

        await this.clientTransport.write(JSON.stringify(errorResponse));
      }
    }
  }

  async start() {
    await this.handleClientToServer();
  }
}
