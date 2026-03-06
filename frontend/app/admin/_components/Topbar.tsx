"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminUI } from "../context/AdminUIContext";

type CurrentUser = {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function Topbar() {
  const { search, setSearch, clearSearch } = useAdminUI();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchMe() {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: "GET",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.success) return;

        if (!ignore && json?.data) {
          setUser(json.data);
        }
      } catch {
        // keep silent in topbar
      }
    }

    fetchMe();

    return () => {
      ignore = true;
    };
  }, []);

  const avatarSrc = user?.avatarUrl
    ? user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : `${API_BASE}${user.avatarUrl}`
    : "/avatar-placeholder.png";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
      {/* Search */}
      <div className="flex items-center gap-3 w-full max-w-xl bg-white rounded-2xl px-4 py-3 shadow-sm">
        <span className="text-gray-400">🔎</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-sm text-gray-700 placeholder:text-gray-400"
          placeholder="Search books, orders..."
        />

        {search.trim().length > 0 && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-xs px-3 py-1 rounded-xl bg-[#f2f5fb] text-gray-700 hover:bg-gray-100 transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center justify-end gap-3">
        <Link
          href="/admin/settings"
          className="bg-white rounded-2xl p-3 shadow-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition"
        >
          ⚙️
        </Link>

        <Link
          href="/user/profile"
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm hover:bg-gray-50 transition cursor-pointer"
        >
          <img
            src={avatarSrc}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover border border-gray-200 bg-gray-100"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (img.dataset.fallbackApplied === "1") return;
              img.dataset.fallbackApplied = "1";
              img.src = "/avatar-placeholder.png";
            }}
          />

          <div className="leading-tight">
            <p className="text-sm font-semibold text-gray-800">
              {user?.fullName || "Admin"}
            </p>
            <p className="text-xs text-gray-500">
              {user?.username ? `@${user.username}` : "BODH"}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}