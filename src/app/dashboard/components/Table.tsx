import { Connection } from "@/types";
import StatusIndicator from "@/app/dashboard/components/StatusIndicator";
import { Link, Clock, Key } from "lucide-react";
import { getTokenExpirationLabel } from "@/utils/token";
export default function AccessTable({
  connectionsData,
}: {
  connectionsData: Connection[];
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
                {connection.app}
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
                {connection.accessToken}
              </div>
            </td>
            <td className="px-6 py-4 hidden md:table-cell">
              <div className="flex items-center">
                <div className="mr-2">
                  <Key className="h-3 w-3 text-muted-foreground" />
                </div>
                {connection.refreshToken}
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
