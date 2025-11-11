import type { ReactNode } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}


