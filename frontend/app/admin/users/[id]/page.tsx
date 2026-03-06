"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
};

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${id}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => setUser(res.data));
  }, [id]);

  if (!user) {
    return <div className="p-8 text-gray-500">Loading user details…</div>;
  }

  // ✅ Avatar fallback
  const avatarSrc = user.avatarUrl
    ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatarUrl}`
    : "/images/default-avatar.png"; // put this in /public

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-8">

        {/* Header */}
        <h1 className="text-2xl font-bold mb-8 text-gray-800">
          User Detail
        </h1>

        <div className="flex items-start gap-8">

          {/* ===============================
              Avatar (POLISHED)
          ================================ */}
          <div className="group relative w-32 h-32 rounded-full overflow-hidden
                          border-2 border-gray-200 shadow-md bg-gray-100
                          flex-shrink-0">

            <img
              src={avatarSrc}
              alt={user.fullName}
              className="
                w-full h-full object-cover
                transition-transform duration-300
                group-hover:scale-110
              "
            />

            {/* Optional hover overlay */}
            <div className="
              absolute inset-0 bg-black/0
              group-hover:bg-black/10
              transition
            " />
          </div>

          {/* ========================
              User Info
          ================================ */}
          <div className="space-y-4 text-gray-700">

            <p>
              <span className="font-semibold">ID:</span>{" "}
              <span className="text-gray-600">{user._id}</span>
            </p>

            <p>
              <span className="font-semibold">Name:</span>{" "}
              {user.fullName}
            </p>

            <p>
              <span className="font-semibold">Email:</span>{" "}
              {user.email}
            </p>

            <p>
              <span className="font-semibold">Username:</span>{" "}
              {user.username}
            </p>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Role:</span>
              <span className="
                px-3 py-1 rounded-full text-sm font-medium
                bg-blue-100 text-blue-700
              ">
                {user.role}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
