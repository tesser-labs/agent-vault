"use client";

import { use, useState } from "react";
import FilterDropdown from "@/app/dashboard/components/FilterDropdown";
import AccessTable from "@/app/dashboard/components/Table";
import { StatsSummary } from "./StatsSummary";
import { Connection as ConnectionData } from "@/app/types";
import { Search } from "lucide-react";
import { revokeAccess } from "@/app/dashboard/actions";

export default function Dashboard({
  connections,
}: {
  connections: Promise<ConnectionData[]>;
}) {
  const [filter, setFilter] = useState("All Tokens");
  const connectionsData = use(connections);

  const handleRevokeAccess = async (connectionId: string) => {
    if (window.confirm("Are you sure you want to revoke this access?")) {
      await revokeAccess(connectionId);
      // Refresh the page to update the list
      window.location.reload();
    }
  };

  return (
    <section>
      <div className="mt-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="bg-background border border-secondary text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5"
            placeholder="Search by app, tool, or client..."
          />
        </div>
        <FilterDropdown
          selected={filter}
          setSelected={setFilter}
        />
      </div>

      <h2 className="text-lg font-medium mt-6 mb-4 text-foreground">
        Connection Tokens
      </h2>
      <div className="mb-4">
        <StatsSummary connectionsData={connectionsData} />
      </div>
      <div className="overflow-x-auto">
        <AccessTable
          connectionsData={connectionsData}
          onRevokeAccess={handleRevokeAccess}
        />
      </div>

      <div className="mt-8 border-t pt-6 text-sm text-muted-foreground flex justify-between">
        <div>Access Management System © 2025</div>
        <div className="flex gap-4">
          <a
            href="#"
            className="hover:text-primary"
          >
            Documentation
          </a>
          <a
            href="#"
            className="hover:text-primary"
          >
            Support
          </a>
        </div>
      </div>
    </section>
  );
}
