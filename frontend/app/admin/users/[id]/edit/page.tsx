"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminUserEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(res => setForm(res.data));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`,
      {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    router.push("/admin/users");
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Edit User</h1>

      <input
        className="border p-2 w-full"
        value={form.fullName}
        onChange={e => setForm({ ...form, fullName: e.target.value })}
        placeholder="Full Name"
      />

      <input
        className="border p-2 w-full"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        placeholder="Email"
      />

      <select
        className="border p-2 w-full"
        value={form.role}
        onChange={e => setForm({ ...form, role: e.target.value })}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Update User
      </button>
    </form>
  );
}
