// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";

// interface User {
//   _id: string;
//   fullName: string;
//   email: string;
//   username: string;
//   role: string;
// }

// export default function AdminUsersPage() {
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
//       credentials: "include",
//     })
//       .then(res => res.json())
//       .then(res => setUsers(res.data))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <div className="p-8">Loading...</div>;

//   return (
//     <div className="p-8">
//       <div className="flex justify-between mb-4">
//         <h1 className="text-2xl font-bold">Users</h1>
//         <Link
//           href="/admin/users/create"
//           className="bg-blue-600 text-white px-4 py-2 rounded"
//         >
//           Create User
//         </Link>
//       </div>

//       <table className="w-full border">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="border p-2">Name</th>
//             <th className="border p-2">Email</th>
//             <th className="border p-2">Role</th>
//             <th className="border p-2">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map(u => (
//             <tr key={u._id}>
//               <td className="border p-2">{u.fullName}</td>
//               <td className="border p-2">{u.email}</td>
//               <td className="border p-2">{u.role}</td>
//               <td className="border p-2 space-x-3">
//                 <Link
//                   href={`/admin/users/${u._id}`}
//                   className="text-blue-600"
//                 >
//                   View
//                 </Link>
//                 <Link
//                   href={`/admin/users/${u._id}/edit`}
//                   className="text-green-600"
//                 >
//                   Edit
//                 </Link>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Failed to fetch users");

        const json = await res.json();
        setUsers(json.data);
      } catch (err: any) {
        setError(err.message || "Error loading users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
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
            className="
              px-5 py-2 rounded-full
              bg-[#1a4fc7] text-white font-medium
              hover:bg-[#143fa3] transition
            "
          >
            + Create User
          </Link>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

          {loading && (
            <div className="p-6 text-gray-500">Loading users…</div>
          )}

          {error && (
            <div className="p-6 text-red-600">{error}</div>
          )}

          {!loading && !error && (
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
                  <tr
                    key={user._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {user.fullName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {user.username}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium
                          ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }
                        `}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
