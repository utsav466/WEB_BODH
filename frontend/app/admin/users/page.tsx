"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type User = {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: "admin" | "user" | string;
};

type Pagination = {
  total: number;
  currentPage: number;
  totalPages: number;
  limit: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
const LIMIT = 8;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    currentPage: 1,
    totalPages: 1,
    limit: LIMIT,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  function normalizePagination(json: any, pageNumber: number) {
    // supports:
    // json.pagination: { total, currentPage, totalPages, limit }
    // json.meta: { total, page, limit }
    // or fallback: total only

    const p = json?.pagination;
    const m = json?.meta;

    const total =
      Number(p?.total ?? m?.total ?? json?.total ?? 0) || 0;

    const limit =
      Number(p?.limit ?? m?.limit ?? LIMIT) || LIMIT;

    const currentPage =
      Number(p?.currentPage ?? m?.page ?? pageNumber) || pageNumber;

    const totalPages =
      Number(p?.totalPages ?? m?.totalPages ?? Math.max(1, Math.ceil(total / limit))) ||
      Math.max(1, Math.ceil(total / limit));

    return { total, limit, currentPage, totalPages };
  }

  async function fetchUsers(pageNumber: number, q: string) {
    try {
      setLoading(true);
      setError("");

      const url = new URL(`${API_BASE}/api/admin/users`);
      url.searchParams.set("page", String(pageNumber));
      url.searchParams.set("limit", String(LIMIT));
      if (q.trim()) url.searchParams.set("search", q.trim());

      const token = localStorage.getItem("token");

      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to fetch users");

      setUsers(Array.isArray(json.data) ? json.data : []);
      setPagination(normalizePagination(json, pageNumber));
    } catch (err: any) {
      setError(err?.message || "Error loading users");
      setUsers([]);
      setPagination({ total: 0, currentPage: 1, totalPages: 1, limit: LIMIT });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(page, debouncedSearch);
  }, [page, debouncedSearch]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this user?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Delete failed");

      // refresh current page
      fetchUsers(page, debouncedSearch);
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    }
  }

  const stats = useMemo(() => {
    const total = pagination.total || users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const normal = users.filter((u) => u.role !== "admin").length;
    return { total, admins, normal };
  }, [users, pagination]);

  const showPagination = pagination.totalPages > 1;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500">Manage registered users</p>
        </div>

        <Link
          href="/admin/users/create"
          className="px-4 py-2 rounded-xl bg-[#ff9f24] text-[#0b1e4a] font-semibold shadow-sm hover:brightness-95"
        >
          + Create User
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <MiniCard title="Total Users" value={String(stats.total)} />
        <MiniCard title="Admins (shown)" value={String(stats.admins)} />
        <MiniCard title="Users (shown)" value={String(stats.normal)} />
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-2 bg-[#f2f5fb] px-4 py-2 rounded-xl w-[400px]">
          🔎
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search users..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <button
          onClick={() => {
            setSearch("");
            setPage(1);
          }}
          className="text-sm font-semibold text-[#1a4fc7]"
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {loading && <div className="text-sm text-gray-500">Loading users...</div>}

        {!loading && error && <div className="text-red-600 text-sm">{error}</div>}

        {!loading && !error && (
          <>
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-3">Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b last:border-none">
                    <td className="py-3 flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#f2f5fb] rounded-full flex items-center justify-center font-semibold">
                        {initials(u.fullName)}
                      </div>

                      <div>
                        <div className="font-semibold">{u.fullName}</div>
                        <div className="text-xs text-gray-500">{u._id.slice(-6)}</div>
                      </div>
                    </td>

                    <td>{u.email}</td>
                    <td>@{u.username}</td>

                    <td>
                      <RolePill role={u.role} />
                    </td>

                    <td className="text-right space-x-3">
                      <Link href={`/admin/users/${u._id}`} className="text-[#1a4fc7] font-semibold">
                        View
                      </Link>

                      <Link href={`/admin/users/${u._id}/edit`} className="text-gray-700">
                        Edit
                      </Link>

                      <button onClick={() => handleDelete(u._id)} className="text-red-600">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            {showPagination && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6">
                <div className="text-sm text-gray-600">
                  Page <span className="font-semibold">{pagination.currentPage}</span> of{" "}
                  <span className="font-semibold">{pagination.totalPages}</span> · Total{" "}
                  <span className="font-semibold">{pagination.total}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-2 rounded-lg bg-white shadow-sm disabled:opacity-50"
                  >
                    ← Prev
                  </button>

                  {getPageButtons(pagination.totalPages, page).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={
                        "px-3 py-2 rounded-lg text-sm font-semibold " +
                        (p === page ? "bg-[#1a4fc7] text-white" : "bg-white shadow-sm")
                      }
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                    className="px-3 py-2 rounded-lg bg-white shadow-sm disabled:opacity-50"
                  >
                    Next →
                  </button>

                  {/* extra “next page” link (you asked for it) */}
                  {page < pagination.totalPages && (
                    <Link
                      href={`/admin/users?page=${page + 1}`}
                      className="ml-2 px-3 py-2 rounded-lg bg-[#ff9f24] text-[#0b1e4a] font-semibold shadow-sm hover:brightness-95"
                      title="Optional: you can use query param navigation"
                    >
                      Go Next Page →
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
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

function RolePill({ role }: { role: string }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={
        "px-3 py-1 rounded-full text-xs font-semibold " +
        (isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")
      }
    >
      {isAdmin ? "Admin" : "User"}
    </span>
  );
}

function initials(name: string) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Keeps pagination buttons compact (ex: 1 2 3 4 5 instead of 1..30)
function getPageButtons(totalPages: number, current: number) {
  const maxButtons = 5;
  if (totalPages <= maxButtons) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const start = Math.max(1, current - 2);
  const end = Math.min(totalPages, start + maxButtons - 1);
  const realStart = Math.max(1, end - maxButtons + 1);

  return Array.from({ length: end - realStart + 1 }, (_, i) => realStart + i);
}