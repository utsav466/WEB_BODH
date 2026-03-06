// "use client";

// import { useEffect, useState } from "react";

// type User = {
//   _id: string;
//   fullName: string;
//   email: string;
//   username: string;
//   role: string;
//   avatarUrl?: string;
//   preferredCurrency?: "USD" | "NPR" | "INR";
// };

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

// export default function UserProfilePage() {
//   const [user, setUser] = useState<User | null>(null);

//   const [fullName, setFullName] = useState("");
//   const [preferredCurrency, setPreferredCurrency] = useState<User["preferredCurrency"]>("NPR");
//   const [avatar, setAvatar] = useState<File | null>(null);

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   async function fetchProfile() {
//     try {
//       setLoading(true);
//       setError("");

//       const token = localStorage.getItem("token");

//       const res = await fetch(`${API_BASE}/api/users/me`, {
//         headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//       });

//       const json = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(json?.message || "Failed to fetch profile");

//       setUser(json.data);
//       setFullName(json.data.fullName);
//       setPreferredCurrency(json.data.preferredCurrency || "NPR");
//     } catch (err: any) {
//       setError(err?.message || "Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setSaving(true);
//     setError("");
//     setSuccess("");

//     try {
//       const token = localStorage.getItem("token");

//       const fd = new FormData();
//       fd.append("fullName", fullName);
//       fd.append("preferredCurrency", preferredCurrency || "NPR");
//       if (avatar) fd.append("avatar", avatar);

//       const res = await fetch(`${API_BASE}/api/users/me`, {
//         method: "PUT",
//         headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//         body: fd,
//       });

//       const json = await res.json().catch(() => ({}));
//       if (!res.ok) throw new Error(json?.message || "Failed to update profile");

//       setUser(json.data);
//       setSuccess("Profile updated successfully ✅");
//     } catch (err: any) {
//       setError(err?.message || "Update failed");
//     } finally {
//       setSaving(false);
//     }
//   }

//   if (loading) {
//     return <div className="min-h-screen bg-[#f6f8fc] px-6 py-12 text-gray-600">Loading profile…</div>;
//   }

//   if (!user) {
//     return <div className="min-h-screen bg-[#f6f8fc] px-6 py-12 text-red-600">{error}</div>;
//   }

//   const avatarSrc = user.avatarUrl
//     ? `${API_BASE}${user.avatarUrl}`
//     : "/avatar-placeholder.png";

//   return (
//     <div className="min-h-screen bg-[#f6f8fc] px-6 py-12">
//       <div className="max-w-4xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
//           <div className="flex flex-col md:flex-row md:items-center gap-6">
//             <div className="flex items-center gap-5">
//               <img
//                 src={avatarSrc}
//                 alt="Avatar"
//                 className="w-20 h-20 rounded-2xl object-cover border border-gray-200"
//               />
//               <div>
//                 <p className="text-lg font-semibold text-gray-900">{user.fullName}</p>
//                 <p className="text-sm text-gray-500">{user.email}</p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   @{user.username} · <span className="font-semibold">{user.role}</span>
//                 </p>
//               </div>
//             </div>

//             <div className="md:ml-auto flex gap-2">
//               <button
//                 type="button"
//                 onClick={fetchProfile}
//                 className="px-4 py-2 rounded-xl bg-[#f2f5fb] text-[#1a4fc7] font-semibold text-sm hover:brightness-95 transition"
//               >
//                 Refresh
//               </button>
//               <div className="px-4 py-2 rounded-xl bg-[#ff9f24] text-[#0b1e4a] font-semibold text-sm">
//                 Currency: {preferredCurrency || "NPR"}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Form Card */}
//         <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
//           <div>
//             <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
//             <p className="text-sm text-gray-500 mt-1">Update your information and preferences.</p>
//           </div>

//           {/* Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//             <Field label="Email" value={user.email} disabled />
//             <Field label="Username" value={user.username} disabled />

//             <Field
//               label="Full Name"
//               value={fullName}
//               onChange={(v) => setFullName(v)}
//               placeholder="Your name"
//             />

//             <div>
//               <label className="block text-sm font-semibold text-gray-800">Preferred Currency</label>
//               <select
//                 value={preferredCurrency}
//                 onChange={(e) => setPreferredCurrency(e.target.value as any)}
//                 className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1a4fc7]"
//               >
//                 <option value="NPR">NPR (Rs)</option>
//                 <option value="USD">USD ($)</option>
//                 <option value="INR">INR (₹)</option>
//               </select>
//             </div>

//             <div className="md:col-span-2">
//               <label className="block text-sm font-semibold text-gray-800">Profile Picture</label>
//               <div className="mt-2 flex items-center gap-3">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => setAvatar(e.target.files?.[0] || null)}
//                   className="text-sm text-gray-600"
//                 />
//                 {avatar ? (
//                   <span className="text-xs text-gray-600 bg-[#f2f5fb] px-3 py-1 rounded-full">
//                     Selected: {avatar.name}
//                   </span>
//                 ) : null}
//               </div>
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
//             <button
//               type="submit"
//               disabled={saving}
//               className={
//                 "px-6 py-3 rounded-xl font-semibold text-sm transition shadow-sm " +
//                 (saving
//                   ? "bg-gray-200 text-gray-500 cursor-not-allowed"
//                   : "bg-[#1a4fc7] text-white hover:bg-[#163fa3]")
//               }
//             >
//               {saving ? "Saving…" : "Save Changes"}
//             </button>

//             {success ? <span className="text-sm text-emerald-700 font-semibold">{success}</span> : null}
//             {error ? <span className="text-sm text-red-600 font-semibold">{error}</span> : null}
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// function Field({
//   label,
//   value,
//   onChange,
//   placeholder,
//   disabled,
// }: {
//   label: string;
//   value: string;
//   onChange?: (v: string) => void;
//   placeholder?: string;
//   disabled?: boolean;
// }) {
//   return (
//     <div>
//       <label className="block text-sm font-semibold text-gray-800">{label}</label>
//       <input
//         value={value}
//         disabled={disabled}
//         onChange={(e) => onChange?.(e.target.value)}
//         placeholder={placeholder}
//         className={
//           "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
//           (disabled
//             ? "bg-[#f2f5fb] border-gray-200 text-gray-600"
//             : "bg-white border-gray-200 focus:border-[#1a4fc7]")
//         }
//       />
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

type User = {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
  preferredCurrency?: "USD" | "NPR" | "INR";
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [fullName, setFullName] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<User["preferredCurrency"]>("NPR");
  const [avatar, setAvatar] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchProfile() {
    try {
      setLoading(true);
      setError("");

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

      if (!res.ok) {
        throw new Error(json?.message || "Failed to fetch profile");
      }

      const userData = json?.data;
      if (!userData) {
        throw new Error("Profile data not found");
      }

      setUser(userData);
      setFullName(userData.fullName || "");
      setPreferredCurrency(userData.preferredCurrency || "NPR");
    } catch (err: any) {
      setError(err?.message || "Failed to load profile");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const fd = new FormData();
      fd.append("fullName", fullName);
      fd.append("preferredCurrency", preferredCurrency || "NPR");

      if (avatar) {
        fd.append("avatar", avatar);
      }

      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PUT",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.message || "Failed to update profile");
      }

      const updatedUser = json?.data;
      if (!updatedUser) {
        throw new Error("Updated profile data not found");
      }

      setUser(updatedUser);
      setFullName(updatedUser.fullName || "");
      setPreferredCurrency(updatedUser.preferredCurrency || "NPR");
      setAvatar(null);
      setSuccess("Profile updated successfully ✅");
    } catch (err: any) {
      setError(err?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-12 text-gray-600">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f8fc] px-6 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <p className="text-red-600 font-semibold">
            {error || "Profile could not be loaded"}
          </p>
        </div>
      </div>
    );
  }

  const avatarSrc = user.avatarUrl
    ? `${API_BASE}${user.avatarUrl}`
    : "/avatar-placeholder.png";

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-5">
              <img
                src={avatarSrc}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border border-gray-200"
              />
              <div>
                <p className="text-lg font-semibold text-gray-900">{user.fullName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">
                  @{user.username} · <span className="font-semibold">{user.role}</span>
                </p>
              </div>
            </div>

            <div className="md:ml-auto flex gap-2">
              <button
                type="button"
                onClick={fetchProfile}
                className="px-4 py-2 rounded-xl bg-[#f2f5fb] text-[#1a4fc7] font-semibold text-sm hover:brightness-95 transition"
              >
                Refresh
              </button>
              <div className="px-4 py-2 rounded-xl bg-[#ff9f24] text-[#0b1e4a] font-semibold text-sm">
                Currency: {preferredCurrency || "NPR"}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6"
        >
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Update your information and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Email" value={user.email} disabled />
            <Field label="Username" value={user.username} disabled />

            <Field
              label="Full Name"
              value={fullName}
              onChange={(v) => setFullName(v)}
              placeholder="Your name"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-800">
                Preferred Currency
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) =>
                  setPreferredCurrency(e.target.value as User["preferredCurrency"])
                }
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1a4fc7]"
              >
                <option value="NPR">NPR (Rs)</option>
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-800">
                Profile Picture
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                  className="text-sm text-gray-600"
                />
                {avatar ? (
                  <span className="text-xs text-gray-600 bg-[#f2f5fb] px-3 py-1 rounded-full">
                    Selected: {avatar.name}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <button
              type="submit"
              disabled={saving}
              className={
                "px-6 py-3 rounded-xl font-semibold text-sm transition shadow-sm " +
                (saving
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#1a4fc7] text-white hover:bg-[#163fa3]")
              }
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            {success ? (
              <span className="text-sm text-emerald-700 font-semibold">{success}</span>
            ) : null}
            {error ? (
              <span className="text-sm text-red-600 font-semibold">{error}</span>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={
          "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
          (disabled
            ? "bg-[#f2f5fb] border-gray-200 text-gray-600"
            : "bg-white border-gray-200 focus:border-[#1a4fc7]")
        }
      />
    </div>
  );
}