"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  label: string;
  href?: string; // if missing => disabled item
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Books", href: "/admin/books" },
  { label: "Reports", href: "/admin/reports" }, 
  { label: "Users", href: "/admin/users" },
  { label: "Settings", href: "/admin/settings" },
];

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <aside className="w-72 shrink-0 bg-[#1537e2] text-white flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/95 rounded-2xl" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">BookStore</p>
            <p className="text-xs text-white/70 -mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      {/* Add New */}
      <div className="px-6 pb-3">
        <button
          className="w-full h-12 rounded-xl bg-[#ff9f24] text-[#0b1e4a] font-semibold
                     flex items-center justify-center gap-2 shadow-sm hover:brightness-95 transition"
          onClick={() => router.push("/admin/users/create")}
          type="button"
        >
          + Add New
        </button>
      </div>

      {/* Menu label */}
      <div className="px-6 pt-4 pb-2 text-white/70 text-xs font-semibold tracking-wide">
        Menu
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 pb-4 space-y-1 text-sm">
        {navItems.map((item) => {
          const isEnabled = !!item.href; // boolean check
          const active = isEnabled ? pathname.startsWith(item.href!) : false;

          if (!isEnabled) {
            return (
              <div
                key={item.label}
                className="flex items-center justify-between px-4 py-3 rounded-xl
                           text-white/55 cursor-not-allowed hover:bg-white/5"
                title="Coming soon"
              >
                <span>{item.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                  Soon
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={
                "flex items-center px-4 py-3 rounded-xl transition " +
                (active
                  ? "bg-white/12 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full h-11 rounded-xl text-sm font-semibold
                     bg-red-600 text-white hover:bg-red-700 transition"
          type="button"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}