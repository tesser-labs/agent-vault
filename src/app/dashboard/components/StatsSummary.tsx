import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { Connection } from "@/app/types";
import { getTokenStatus } from "@/utils/token";

export function StatsSummary({
  connectionsData,
}: {
  connectionsData: Connection[];
}) {
  const validTokens = connectionsData.filter(
    (token) => getTokenStatus(token.expiration) === "valid"
  ).length;

  const expiringTokens = connectionsData.filter(
    (token) => getTokenStatus(token.expiration) === "expiring"
  ).length;

  const expiredTokens = connectionsData.filter(
    (token) => getTokenStatus(token.expiration) === "expired"
  ).length;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-background shadow-sm rounded-lg border border-secondary p-4 flex justify-between items-center">
        <div>
          <div className="text-muted-foreground text-sm">Total Connections</div>
          <div className="text-2xl font-bold text-foreground">
            {connectionsData.length}
          </div>
        </div>
        <div className="bg-secondary/50 p-2 rounded-full">
          <Activity className="w-6 h-6 text-primary" />
        </div>
      </div>

      <div className="bg-background shadow-sm rounded-lg border border-secondary p-4 flex justify-between items-center">
        <div>
          <div className="text-muted-foreground text-sm">Valid Tokens</div>
          <div className="text-2xl font-bold text-foreground">
            {validTokens}
          </div>
        </div>
        <div className="bg-secondary/50 p-2 rounded-full">
          <CheckCircle className="w-6 h-6 text-green-500" />
        </div>
      </div>

      <div className="bg-background shadow-sm rounded-lg border border-secondary p-4 flex justify-between items-center">
        <div>
          <div className="text-muted-foreground text-sm">Expiring Soon</div>
          <div className="text-2xl font-bold text-foreground">
            {expiringTokens}
          </div>
        </div>
        <div className="bg-secondary/50 p-2 rounded-full">
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
        </div>
      </div>

      <div className="bg-background shadow-sm rounded-lg border border-secondary p-4 flex justify-between items-center">
        <div>
          <div className="text-muted-foreground text-sm">Expired Tokens</div>
          <div className="text-2xl font-bold text-foreground">
            {expiredTokens}
          </div>
        </div>
        <div className="bg-secondary/50 p-2 rounded-full">
          <XCircle className="w-6 h-6 text-red-500" />
        </div>
      </div>
    </div>
  );
}
