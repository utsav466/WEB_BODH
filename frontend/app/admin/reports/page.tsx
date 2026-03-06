"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAdminUI } from "../context/AdminUIContext";

type ReportRange = "7d" | "30d" | "90d";

type DailyItem = {
  date: string;
  revenue: number;
  orders: number;
};

type TopBook = {
  title: string;
  qty: number;
  revenue: number;
};

type ReportData = {
  range: string;
  revenue: number;
  orders: number;
  delivered: number;
  cancelled: number;
  daily: DailyItem[];
  topBooks: TopBook[];
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: Partial<ReportData>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function ReportsPage() {
  const { search } = useAdminUI();
  const [range, setRange] = useState<ReportRange>("30d");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchReport() {
      try {
        setLoading(true);
        setErrMsg("");

        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          throw new Error("No token found. Please login again.");
        }

        const response = await fetch(
          `${API_BASE}/api/admin/reports/sales?range=${range}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        let json: ApiResponse;
        try {
          json = await response.json();
        } catch {
          throw new Error("Backend did not return valid JSON.");
        }

        if (!response.ok || !json?.success) {
          throw new Error(json?.message || "Failed to load sales report.");
        }

        const apiData = json.data || {};

        const normalized: ReportData = {
          range: String(apiData.range || range),
          revenue: Number(apiData.revenue || 0),
          orders: Number(apiData.orders || 0),
          delivered: Number(apiData.delivered || 0),
          cancelled: Number(apiData.cancelled || 0),
          daily: Array.isArray(apiData.daily)
            ? apiData.daily.map((item: any) => ({
                date: String(item?.date || ""),
                revenue: Number(item?.revenue || 0),
                orders: Number(item?.orders || 0),
              }))
            : [],
          topBooks: Array.isArray(apiData.topBooks)
            ? apiData.topBooks.map((item: any) => ({
                title: String(item?.title || ""),
                qty: Number(item?.qty || 0),
                revenue: Number(item?.revenue || 0),
              }))
            : [],
        };

        if (!ignore) {
          setData(normalized);
        }
      } catch (error: any) {
        if (!ignore) {
          setErrMsg(error?.message || "Failed to load report.");
          setData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchReport();

    return () => {
      ignore = true;
    };
  }, [range]);

  const maxRevenue = useMemo(() => {
    if (!data?.daily?.length) return 1;
    return Math.max(...data.daily.map((d) => d.revenue), 1);
  }, [data]);

  const filteredTopBooks = useMemo(() => {
    if (!data?.topBooks) return [];
    const q = (search || "").trim().toLowerCase();
    if (!q) return data.topBooks;
    return data.topBooks.filter((b) => b.title.toLowerCase().includes(q));
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">
            Sales overview and performance analytics.
          </p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value as ReportRange)}
          className="bg-white rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-100 outline-none"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">
          Loading report...
        </div>
      )}

      {!loading && errMsg && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-red-600 font-semibold">{errMsg}</p>
          <p className="text-xs text-gray-500 mt-2">
            Check these:
            <br />
            1. Backend is running on <span className="font-semibold">5050</span>
            <br />
            2. Token exists in localStorage
            <br />
            3. API route is correct:
            <span className="font-semibold"> /api/admin/reports/sales</span>
            <br />
            4. Admin auth middleware is allowing this request
          </p>
        </div>
      )}

      {!loading && !errMsg && data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Revenue"
              value={money(data.revenue)}
              trend="+"
              note={`Range: ${data.range}`}
            />
            <MetricCard
              title="Orders"
              value={String(data.orders)}
              trend={data.orders >= 0 ? "+" : "-"}
              note="Total orders"
            />
            <MetricCard
              title="Delivered"
              value={String(data.delivered)}
              trend="+"
              note="Completed"
            />
            <MetricCard
              title="Cancelled"
              value={String(data.cancelled)}
              trend="-"
              note="Excluded from revenue"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Revenue Trend
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Daily revenue from backend
                </p>
              </div>
              <div className="text-xs text-gray-500">Live backend data</div>
            </div>

            {data.daily.length === 0 ? (
              <div className="mt-6 text-sm text-gray-500">
                No chart data returned from backend.
              </div>
            ) : (
              <>
                <div className="mt-6 h-48 flex items-end gap-2">
                  {data.daily.map((d) => {
                    const h = Math.max(
                      6,
                      Math.round((d.revenue / maxRevenue) * 100)
                    );

                    return (
                      <div
                        key={d.date}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div
                          className="w-full rounded-t-lg bg-[#1a4fc7] opacity-90"
                          style={{ height: `${h}%` }}
                          title={`${d.date}: ${money(d.revenue)} (${d.orders} orders)`}
                        />
                        <span className="text-[10px] text-gray-500">
                          {d.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Total points from backend: {data.daily.length}
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Top Selling Books
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Top books from backend
                </p>
              </div>
              <div className="text-xs text-gray-500">
                Search filters this table
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr className="border-b">
                    <th className="py-3 pr-4">Title</th>
                    <th className="py-3 pr-4">Qty</th>
                    <th className="py-3 pr-0 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopBooks.map((b) => (
                    <tr
                      key={b.title}
                      className="border-b last:border-none text-gray-700"
                    >
                      <td className="py-3 pr-4 font-semibold text-gray-800">
                        {b.title}
                      </td>
                      <td className="py-3 pr-4">{b.qty}</td>
                      <td className="py-3 pr-0 text-right font-semibold">
                        {money(b.revenue)}
                      </td>
                    </tr>
                  ))}

                  {filteredTopBooks.length === 0 && (
                    <tr>
                      <td
                        className="py-8 text-center text-gray-500"
                        colSpan={3}
                      >
                        No results from backend.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  note,
  trend,
}: {
  title: string;
  value: string;
  note: string;
  trend: "+" | "-";
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{title}</p>
        <span
          className={
            "text-xs font-semibold px-2 py-1 rounded-full " +
            (trend === "+"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700")
          }
        >
          {trend}
        </span>
      </div>
      <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-2">{note}</p>
    </div>
  );
}

function money(n: number) {
  return `Rs ${new Intl.NumberFormat("en-NP", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n || 0)}`;
}