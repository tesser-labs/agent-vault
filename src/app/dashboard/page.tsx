"use client";

import { useState } from "react";
import { connectionsData } from "./mock-data";
import FilterDropdown from "@/app/dashboard/components/FilterDropdown";
import AccessTable from "@/app/dashboard/components/Table";
import { Shield, Search } from "lucide-react";
import { StatsSummary } from "./components/StatsSummary";

export default function Dashboard() {
  const [filter, setFilter] = useState("All Tokens");

  return (
    <div className="min-h-screen bg-background px-4 md:px-6">
      <header className="border-b py-10 sticky top-0 z-10 bg-primary/10 mb-6 flex items-center justify-between">
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
        <AccessTable connectionsData={connectionsData} />
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
    </div>
  );
}
