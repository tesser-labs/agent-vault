import { Shield } from "lucide-react";
import Dashboard from "./components/Dashboard";
import tokenManager from "@/cache/token";
import { Connection as ConnectionData } from "@/app/types";
import { Suspense } from "react";
async function getConnections() {
  const connections: ConnectionData[] = [];
  for await (const key of tokenManager.keys()) {
    const connection = await tokenManager.get(key);
    if (connection) {
      const connectionData: ConnectionData = {
        app: `${connection.provider}/${connection.resource}/${connection.service}`,
        client: connection.agent?.name ?? "Unknown",
        accessToken: connection.access_token,
        refreshToken: connection.refresh_token ?? "",
        expiration: connection.expiry_date
          ? new Date(connection.expiry_date)
          : "never",
      };
      connections.push(connectionData);
    }
  }
  return connections;
}

export default async function Page() {
  // get all connections
  const connections = getConnections();
  return (
    <div className="min-h-screen bg-background px-4 md:px-6">
      <header className="border-b py-10 sticky top-0 z-10 bg-background/80 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-primary mr-2">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-medium text-foreground">
            Access Management Dashboard
          </h1>
        </div>
        <div className="flex">
          <button className="mr-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2 px-4 rounded">
            Refresh
          </button>
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground py-2 px-4 rounded">
            Add Connection
          </button>
        </div>
      </header>
      <Suspense fallback={<div>Loading...</div>}>
        <Dashboard connections={connections} />
      </Suspense>
    </div>
  );
}
