import { getTokenStatus } from "@/utils/token";
import React from "react";

type StatusIndicatorProps = {
  expiration: Date | "never";
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ expiration }) => {
  const status = getTokenStatus(expiration);
  if (status === "valid") {
    return (
      <span className="flex items-center">
        <span className="w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
        <span className="text-green-500">Valid</span>
      </span>
    );
  } else if (status === "expiring") {
    return (
      <span className="flex items-center">
        <span className="w-2 h-2 mr-2 bg-yellow-500 rounded-full"></span>
        <span className="text-yellow-500">Expiring Soon</span>
      </span>
    );
  } else {
    return (
      <span className="flex items-center">
        <span className="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
        <span className="text-red-500">Expired</span>
      </span>
    );
  }
};

export default StatusIndicator;
