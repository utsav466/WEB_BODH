"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminUI } from "../context/AdminUIContext";
import { money } from "../../../lib/money";


type BackendBook = {
  _id: string;
  title: string;
  author: string;
  category?: string;
  isbn?: string;
  price: number;
  stock: number;
  status: "active" | "draft";
  description?: string;
  coverUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BookStatusUI = "Active" | "Draft" | "Out of Stock";

type BookRow = {
  id: string; // mongo _id
  title: string;
  author: string;
  price: number;
  stock: number;
  status: BookStatusUI;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export default function BooksPage() {
  const { search, clearSearch } = useAdminUI();

  const [statusFilter, setStatusFilter] = useState<BookStatusUI | "All">("All");
  const [sortBy, setSortBy] = useState<"title" | "priceDesc" | "stockAsc">("title");

  const [books, setBooks] = useState<BookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");


  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr("");

      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/books?limit=50`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || `Failed to load books (${res.status})`);
        }


        const items: BackendBook[] = data.items || [];

        const mapped: BookRow[] = items.map((b) => ({
          id: b._id,
          title: b.title,
          author: b.author,
          price: Number(b.price || 0),
          stock: Number(b.stock || 0),
          status: b.stock <= 0 ? "Out of Stock" : b.status === "draft" ? "Draft" : "Active",
        }));

        if (alive) setBooks(mapped);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load books");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = [...books];

    if (statusFilter !== "All") {
      list = list.filter((b) => b.status === statusFilter);
    }

    if (q) {
      list = list.filter((b) => {
        const hay = `${b.title} ${b.author} ${b.status}`.toLowerCase();
        return hay.includes(q);
      });
    }

    if (sortBy === "title") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => a.stock - b.stock);
    }

    return list;
  }, [books, search, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const active = filtered.filter((b) => b.status === "Active").length;
    const oos = filtered.filter((b) => b.stock <= 0 || b.status === "Out of Stock").length;
    const low = filtered.filter((b) => b.stock > 0 && b.stock <= 5).length;
    return { total: filtered.length, active, oos, low };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Books</h1>
          <p className="text-sm text-gray-500">Manage your book catalog and inventory.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/books/create"
            className="px-4 py-2 rounded-xl bg-[#ff9f24] text-[#0b1e4a] font-semibold shadow-sm hover:brightness-95 transition"
          >
            + Add Book
          </Link>

          <button
            type="button"
            onClick={clearSearch}
            className="px-4 py-2 rounded-xl bg-white shadow-sm text-sm font-semibold text-[#1a4fc7] hover:bg-gray-50"
          >
            Clear Search
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">
          Loading books…
        </div>
      )}

      {!loading && err && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-red-600 font-semibold">{err}</p>
          <p className="text-xs text-gray-500 mt-2">
            Make sure your backend is running at{" "}
            <span className="font-semibold">{API_URL}</span> and you are logged in (token exists).
          </p>
        </div>
      )}

      {!loading && !err && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <MiniCard title="Total" value={String(stats.total)} />
            <MiniCard title="Active" value={String(stats.active)} />
            <MiniCard title="Low Stock" value={String(stats.low)} />
            <MiniCard title="Out of Stock" value={String(stats.oos)} />
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
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#f2f5fb] rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
              >
                <option value="title">Sort: Title (A–Z)</option>
                <option value="priceDesc">Sort: Price (High → Low)</option>
                <option value="stockAsc">Sort: Stock (Low → High)</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-800">{stats.total}</span> books
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-800">Book List</h2>
              <span className="text-xs text-gray-500">Search is connected to the Topbar</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr className="border-b">
                    <th className="py-3 pr-4">ID</th>
                    <th className="py-3 pr-4">Title</th>
                    <th className="py-3 pr-4">Author</th>
                    <th className="py-3 pr-4">Price</th>
                    <th className="py-3 pr-4">Stock</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-0 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b last:border-none text-gray-700">
                      <td className="py-3 pr-4 font-semibold text-gray-800">
                        {b.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-gray-800">{b.title}</td>
                      <td className="py-3 pr-4">{b.author}</td>
                      <td className="py-3 pr-4 font-semibold">{money(b.price)}</td>
                      <td className="py-3 pr-4">{b.stock}</td>
                      <td className="py-3 pr-4">
                        <BookPill status={b.status} stock={b.stock} />
                      </td>
                      <td className="py-3 pr-0 text-right">
                        <Link
                          href={`/admin/books/${b.id}/edit`}
                          className="text-[#1a4fc7] font-semibold hover:underline"
                        >
                          Edit →
                        </Link>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td className="py-8 text-center text-gray-500" colSpan={7}>
                        No books matched your filters/search.
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

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function BookPill({ status, stock }: { status: BookStatusUI; stock: number }) {
  const normalized: BookStatusUI = stock <= 0 ? "Out of Stock" : status;

  const map: Record<BookStatusUI, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Draft: "bg-blue-100 text-blue-700",
    "Out of Stock": "bg-red-100 text-red-700",
  };

  return (
    <span className={"text-xs px-3 py-1 rounded-full font-medium " + map[normalized]}>
      {normalized}
    </span>
  );
}
