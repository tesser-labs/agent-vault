import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Management Dashboard",
  description: "Manage API connections and token access",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <section>{children}</section>;
}
