"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminUI } from "../context/AdminUIContext";
import { money } from "../../../lib/money";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

type Order = {
  _id: string;
  customerName: string;
  customerEmail?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

type Meta = {
  total: number;
  page: number;
  limit: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
const LIMIT = 10;

export default function OrdersPage() {
  const { search, setSearch, clearSearch } = useAdminUI();

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");
  const [sortBy, setSortBy] = useState<"newest" | "amountDesc" | "amountAsc">("newest");

  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: LIMIT });

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch orders with pagination
  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setErrMsg("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrMsg("No token found. Please login again.");
          setLoading(false);
          return;
        }

        const url = new URL(`${API_BASE}/api/admin/orders`);
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", String(LIMIT));

        if (debouncedSearch.trim()) url.searchParams.set("q", debouncedSearch.trim());
        if (statusFilter !== "All") url.searchParams.set("status", statusFilter);

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(json?.message || "Failed to load orders");
        }

        if (!ignore) {
          setOrders(Array.isArray(json.data) ? json.data : []);

          const m = json?.meta;
          setMeta({
            total: Number(m?.total ?? 0),
            page: Number(m?.page ?? page),
            limit: Number(m?.limit ?? LIMIT),
          });
        }
      } catch (e: any) {
        if (!ignore) setErrMsg(e?.message || "Failed to load orders");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, [page, debouncedSearch, statusFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || LIMIT)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const filteredSorted = useMemo(() => {
    let list = [...orders];

    if (sortBy === "newest") {
      list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } else if (sortBy === "amountDesc") {
      list.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
    } else {
      list.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
    }

    return list;
  }, [orders, sortBy]);

  const totals = useMemo(() => {
    const revenue = filteredSorted.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const delivered = filteredSorted.filter((o) => o.status === "Delivered").length;
    return { revenue, delivered, count: filteredSorted.length };
  }, [filteredSorted]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Orders</h1>
          <p className="text-sm text-gray-500">Manage and track bookstore orders.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearSearch}
            className="px-4 py-2 rounded-xl bg-white shadow-sm text-sm font-semibold text-[#1a4fc7] hover:bg-gray-50"
          >
            Clear Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-[#f2f5fb] rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#f2f5fb] rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
          >
            <option value="newest">Sort: Newest</option>
            <option value="amountDesc">Sort: Amount (High → Low)</option>
            <option value="amountAsc">Sort: Amount (Low → High)</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-800">{totals.count}</span> orders (this page) · Revenue{" "}
          <span className="font-semibold text-gray-800">{money(totals.revenue)}</span>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">Loading orders...</div>
      )}

      {!loading && errMsg && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-red-600 font-semibold">{errMsg}</p>
          <p className="text-xs text-gray-500 mt-2">
            Make sure backend is running on <span className="font-semibold">5050</span> and you are logged in.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !errMsg && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Order List</h2>
            <span className="text-sm text-gray-500">
              Delivered (this page): <span className="font-semibold text-gray-800">{totals.delivered}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr className="border-b">
                  <th className="py-3 pr-4">Order</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Amount</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-0 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.map((o) => (
                  <tr key={o._id} className="border-b last:border-none text-gray-700">
                    <td className="py-3 pr-4 font-semibold text-gray-800">{o._id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-gray-800">{o.customerName}</div>
                      {o.customerEmail ? <div className="text-xs text-gray-500">{o.customerEmail}</div> : null}
                    </td>
                    <td className="py-3 pr-4">{formatDate(o.createdAt)}</td>
                    <td className="py-3 pr-4 font-semibold">{money(o.totalAmount)}</td>
                    <td className="py-3 pr-4">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="py-3 pr-0 text-right">
                      <Link href={`/admin/orders/${o._id}`} className="text-[#1a4fc7] font-semibold hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredSorted.length === 0 && (
                  <tr>
                    <td className="py-8 text-center text-gray-500" colSpan={6}>
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-5 border-t border-gray-100 mt-5">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-800">{page}</span> of{" "}
                <span className="font-semibold text-gray-800">{totalPages}</span> · Total{" "}
                <span className="font-semibold text-gray-800">{meta.total}</span>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={!canPrev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    "px-4 py-2 rounded-xl text-sm font-semibold transition " +
                    (!canPrev
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white shadow-sm text-gray-800 hover:bg-gray-50")
                  }
                >
                  ← Previous
                </button>

                <button
                  disabled={!canNext}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={
                    "px-4 py-2 rounded-xl text-sm font-semibold transition " +
                    (!canNext
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-white shadow-sm text-gray-800 hover:bg-gray-50")
                  }
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
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

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-NP", { month: "short", day: "2-digit", year: "numeric" });
}