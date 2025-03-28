import { Connection } from "@/app/types";
import StatusIndicator from "@/app/dashboard/components/StatusIndicator";
import { Link, Clock, Key, XCircle } from "lucide-react";
import { getTokenExpirationLabel } from "@/utils/token";
import { truncateString } from "@/utils/string";

const MAX_TOKEN_DISPLAY_LENGTH = 10;

export default function AccessTable({
  connectionsData,
  onRevokeAccess,
}: {
  connectionsData: Connection[];
  onRevokeAccess: (connectionId: string) => void;
}) {
  return (
    <table className="w-full text-sm text-left text-foreground">
      <thead className="text-xs uppercase text-muted-foreground bg-secondary/50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3"
          >
            App
          </th>
          <th
            scope="col"
            className="px-6 py-3 hidden md:table-cell"
          >
            Client
          </th>
          <th
            scope="col"
            className="px-6 py-3 hidden md:table-cell"
          >
            Access Token
          </th>
          <th
            scope="col"
            className="px-6 py-3 hidden md:table-cell"
          >
            Refresh Token
          </th>
          <th
            scope="col"
            className="px-6 py-3"
          >
            Expiration
          </th>
          <th
            scope="col"
            className="px-6 py-3"
          >
            Status
          </th>
          <th
            scope="col"
            className="px-6 py-3"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {connectionsData.map((connection, index) => (
          <tr
            key={index}
            className="bg-background border-b border-secondary hover:bg-secondary/20"
          >
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="text-primary mr-2">
                  <Link className="h-4 w-4" />
                </div>
                {connection.id}
              </div>
            </td>
            <td className="px-6 py-4 hidden md:table-cell">
              {connection.client}
            </td>
            <td className="px-6 py-4 hidden md:table-cell">
              <div className="flex items-center">
                <div className="mr-2">
                  <Key className="h-3 w-3 text-muted-foreground" />
                </div>
                {truncateString(
                  connection.accessToken,
                  MAX_TOKEN_DISPLAY_LENGTH
                )}
              </div>
            </td>
            <td className="px-6 py-4 hidden md:table-cell">
              <div className="flex items-center">
                <div className="mr-2">
                  <Key className="h-3 w-3 text-muted-foreground" />
                </div>
                {truncateString(
                  connection.refreshToken,
                  MAX_TOKEN_DISPLAY_LENGTH
                )}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div className="mr-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
                {getTokenExpirationLabel(connection.expiration)}
              </div>
            </td>
            <td className="px-6 py-4">
              <StatusIndicator expiration={connection.expiration} />
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => onRevokeAccess(connection.id)}
                className="flex items-center text-destructive hover:text-destructive/80"
                title="Revoke Access"
              >
                <XCircle className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Revoke</span>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
