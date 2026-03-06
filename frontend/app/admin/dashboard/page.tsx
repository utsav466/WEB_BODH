"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useAdminUI } from "../context/AdminUIContext";
import { money } from "../../../lib/money";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

type RecentOrder = {
  _id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
};

type LowStockBook = {
  _id: string;
  title: string;
  stock: number;
  price: number;
};

type DashboardStats = {
  totalUsers: number;
  totalBooks: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: RecentOrder[];
  lowStockBooks: LowStockBook[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function AdminDashboardPage() {
  const { search, setSearch, clearSearch } = useAdminUI();
  const [period, setPeriod] = useState<"today" | "month">("today");

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setErrMsg("");

      try {
        const res = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
          credentials: "include",
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Failed to load dashboard stats");

        if (!ignore) setStats(json.data);
      } catch (e: any) {
        if (!ignore) setErrMsg(e?.message || "Failed to load dashboard stats");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredRecentOrders = useMemo(() => {
    const list = stats?.recentOrders ?? [];
    const q = search.trim().toLowerCase();

    const byPeriod = list.filter((o) => {
      if (period === "today") return isToday(o.createdAt);
      return isThisMonth(o.createdAt);
    });

    if (!q) return byPeriod;

    return byPeriod.filter((o) => {
      const hay = `${o._id} ${o.customerName ?? ""} ${o.customerEmail ?? ""} ${o.status}`.toLowerCase();
      return hay.includes(q);
    });
  }, [stats, search, period]);

  const revenuePeriod = useMemo(
    () => filteredRecentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [filteredRecentOrders]
  );

  // Demo trend badges (fast for presentation). Later you can compute from last month vs this month.
  const trends = useMemo(() => {
    return {
      users: "+6.4%",
      books: "+2.1%",
      orders: "+9.8%",
      revenue: "+12.3%",
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600 border border-gray-100">
        Loading dashboard...
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm text-red-600 font-semibold">{errMsg}</p>
        <p className="text-xs text-gray-500 mt-2">
          Make sure backend is running on <span className="font-semibold">5050</span> and you are logged in as admin.
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* ===== Top Stats (WHITE PROFESSIONAL CARDS) ===== */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatBox
          title="Total Users"
          value={String(stats.totalUsers)}
          hint="All registered accounts"
          trend={trends.users}
          icon={<IconUsers />}
        />
        <StatBox
          title="Total Books"
          value={String(stats.totalBooks)}
          hint="Catalog size"
          trend={trends.books}
          icon={<IconBooks />}
        />
        <StatBox
          title="Total Orders"
          value={String(stats.totalOrders)}
          hint="All-time orders"
          trend={trends.orders}
          icon={<IconOrders />}
        />
        <StatBox
          title="Total Revenue"
          value={money(stats.totalRevenue)}
          hint="Excludes cancelled"
          trend={trends.revenue}
          icon={<IconRevenue />}
          accent
        />
      </section>

      {/* ===== Main Grid ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title="Sales Overview" rightSlot={<Segment value={period} onChange={setPeriod} />}>
              <div className="bg-[#f2f5fb] rounded-2xl p-5 border border-gray-100">
                <p className="text-xs text-gray-500">Revenue (recent list, filtered)</p>
                <p className="text-3xl font-semibold text-gray-900 mt-1">{money(revenuePeriod)}</p>

                <div className="mt-5 space-y-3">
                  <MiniStat label="Recent Orders" value={String(filteredRecentOrders.length)} />
                  <MiniStat label="Books (total)" value={String(stats.totalBooks)} />
                </div>

                <div className="mt-5">
                  <label className="text-xs text-gray-500">Filter (connected to topbar)</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g. delivered, customer name..."
                    className="mt-2 w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border border-gray-200 focus:border-[#1a4fc7]"
                  />
                </div>
              </div>
            </Card>

            <Card
              title="Recent Orders"
              rightSlot={
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-sm font-semibold text-[#1a4fc7] hover:underline"
                >
                  Clear Filters
                </button>
              }
            >
              <div className="space-y-3">
                {filteredRecentOrders.slice(0, 6).map((o) => (
                  <div key={o._id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-gray-500 w-14 shrink-0">
                        {o._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="font-medium text-gray-900 truncate">
                        {o.customerName || "Customer"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">{money(o.totalAmount)}</span>
                      <StatusPill status={o.status} />
                    </div>
                  </div>
                ))}

                {filteredRecentOrders.length === 0 && (
                  <div className="text-sm text-gray-500">No recent orders.</div>
                )}

                <div className="pt-2">
                  <Link href="/admin/orders" className="text-sm font-semibold text-[#1a4fc7]">
                    View All →
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          <Card
            title="Low Stock Books"
            rightSlot={
              <Link href="/admin/books" className="text-sm font-semibold text-[#1a4fc7] hover:underline">
                Manage →
              </Link>
            }
          >
            <div className="space-y-3">
              {stats.lowStockBooks?.length ? (
                stats.lowStockBooks.map((b) => (
                  <div key={b._id} className="flex items-center justify-between text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{b.title}</p>
                      <p className="text-xs text-gray-500">Price: {money(b.price)}</p>
                    </div>
                    <span
                      className={
                        "text-xs px-3 py-1 rounded-full font-semibold " +
                        (b.stock === 0 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")
                      }
                    >
                      Stock: {b.stock}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No low-stock books 🎉</div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="space-y-3">
              <ActionLink title="Orders" description="View & update statuses." href="/admin/orders" action="Go to Orders" />
              <ActionLink title="Books" description="Manage catalog." href="/admin/books" action="Go to Books" />
              <ActionLink title="Users" description="Manage users/admins." href="/admin/users" action="Go to Users" />
            </div>
          </Card>

          <Card title="Summary">
            <div className="space-y-2 text-sm text-gray-700">
              <Row label="Total Revenue" value={money(stats.totalRevenue)} />
              <Row label="Total Orders" value={String(stats.totalOrders)} />
              <Row label="Total Users" value={String(stats.totalUsers)} />
              <Row label="Total Books" value={String(stats.totalBooks)} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================= UI Parts ================= */

function StatBox({
  title,
  value,
  hint,
  trend,
  icon,
  accent,
}: {
  title: string;
  value: string;
  hint?: string;
  trend?: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  const positive = (trend ?? "").trim().startsWith("+");

  return (
    <div
      className={
        "bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition " +
        (accent ? "ring-1 ring-[#1a4fc7]/15" : "")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}

  {trend ? (
  <div className="mt-3 inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold border border-gray-200">
    <span
      className={
        "inline-flex items-center justify-center w-5 h-5 rounded-full text-white " +
        (positive ? "bg-emerald-500" : "bg-red-500")
      }
      aria-hidden
    >
      {positive ? "↑" : "↓"}
    </span>
    <span className={positive ? "text-emerald-700" : "text-red-700"}>{trend}</span>
  </div>
) : null}
        </div>

        <div className="w-11 h-11 rounded-2xl bg-[#f2f5fb] border border-gray-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  rightSlot,
  className = "",
  children,
}: {
  title: string;
  rightSlot?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={"bg-white rounded-2xl p-6 shadow-sm border border-gray-100 " + className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}

function Segment({
  value,
  onChange,
}: {
  value: "today" | "month";
  onChange: (v: "today" | "month") => void;
}) {
  return (
    <div className="flex items-center gap-2 bg-[#f2f5fb] rounded-xl p-1 border border-gray-100">
      <button
        type="button"
        onClick={() => onChange("today")}
        className={
          "px-3 py-1.5 rounded-lg text-sm font-semibold transition " +
          (value === "today"
            ? "bg-white shadow-sm text-[#1a4fc7]"
            : "text-gray-600 hover:text-gray-800")
        }
      >
        Today
      </button>
      <button
        type="button"
        onClick={() => onChange("month")}
        className={
          "px-3 py-1.5 rounded-lg text-sm font-semibold transition " +
          (value === "month"
            ? "bg-white shadow-sm text-[#1a4fc7]"
            : "text-gray-600 hover:text-gray-800")
        }
      >
        This Month
      </button>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-2xl font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    Pending: "bg-orange-100 text-orange-700",
    Processing: "bg-violet-100 text-violet-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return <span className={"text-xs px-3 py-1 rounded-full font-medium " + map[status]}>{status}</span>;
}

function ActionLink({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      <Link href={href} className="inline-block mt-3 text-sm font-semibold text-[#1a4fc7]">
        {action} →
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

/* ================= Icons (Inline SVG) ================= */

function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#1a4fc7]">
      <path
        d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 20c0-2.761 2.686-5 6-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 20c0-2.761-2.686-5-6-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 20c0-3.314 2.239-6 5-6s5 2.686 5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconBooks() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#1a4fc7]">
      <path
        d="M4 19a2 2 0 0 0 2 2h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 3h12a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 7h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 11h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconOrders() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#1a4fc7]">
      <path
        d="M7 3h10l1 5H6l1-5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 8h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 16h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconRevenue() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#1a4fc7]">
      <path
        d="M12 1v22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17 5.5c0-2-2.239-3.5-5-3.5S7 3.5 7 5.5 9.239 9 12 9s5 1.5 5 3.5S14.761 16 12 16s-5 1.5-5 3.5S9.239 23 12 23s5-1.5 5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ================= Helpers ================= */



function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isThisMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}