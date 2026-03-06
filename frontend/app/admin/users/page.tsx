"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
};

type Pagination = {
  total: number;
  currentPage: number;
  totalPages: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?page=${pageNumber}&limit=5&search=${search}`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch users");

      const json = await res.json();
      setUsers(json.data);
      setPagination(json.pagination);
    } catch (err: any) {
      setError(err.message || "Error loading users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page, search]);

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete user");

      fetchUsers(page);
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1a4fc7]">
              User Management
            </h1>
            <p className="text-gray-500 mt-1">
              Manage all registered users
            </p>
          </div>

          <Link
            href="/admin/users/create"
            className="px-5 py-2 rounded-full bg-[#1a4fc7] text-white font-medium hover:bg-[#143fa3] transition"
          >
            + Create User
          </Link>
        </div>

        {/* SEARCH INPUT */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full border px-4 py-2 rounded-md"
          />
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

          {loading && <div className="p-6">Loading users…</div>}
          {error && <div className="p-6 text-red-600">{error}</div>}

          {!loading && !error && (
            <>
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="text-left px-6 py-4">Name</th>
                    <th className="text-left px-6 py-4">Email</th>
                    <th className="text-left px-6 py-4">Username</th>
                    <th className="text-left px-6 py-4">Role</th>
                    <th className="text-right px-6 py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {user.fullName}
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4">{user.username}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4">
                        <Link
                          href={`/admin/users/${user._id}`}
                          className="text-[#1a4fc7] hover:underline"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/users/${user._id}/edit`}
                          className="text-gray-600 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {pagination && (
                <div className="flex justify-between items-center p-6 border-t">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
