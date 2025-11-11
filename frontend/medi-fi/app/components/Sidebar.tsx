"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/records", label: "Records" },
  { href: "/share", label: "Share Access" },
  { href: "/doctors", label: "Doctors" },
  { href: "/settings", label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-white/10 md:bg-black/60">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <span className="text-xl font-semibold tracking-wide">MediFi</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "block rounded-md px-3 py-2 text-sm transition-colors " +
                (active
                  ? "bg-white text-black"
                  : "text-white/80 hover:bg-white/10 hover:text-white")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 text-xs text-white/50">
        v0.1.0
      </div>
    </aside>
  );
}

export default Sidebar;


