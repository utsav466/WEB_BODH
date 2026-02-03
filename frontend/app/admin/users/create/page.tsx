"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminCreateUserPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    role: "user",
    avatar: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setForm({ ...form, avatar: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      fd.append("username", form.username);
      fd.append("password", form.password);
      fd.append("role", form.role);

      if (form.avatar) {
        fd.append("avatar", form.avatar);
      }

const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
  {
    method: "POST",
    credentials: "include", // 🔥 this sends auth_token cookie
    body: fd,
  }
);


      if (!res.ok) throw new Error("Failed to create user");

      router.push("/admin/users");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Create User</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <select
          name="role"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
