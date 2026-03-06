"use client";

import { useEffect, useState } from "react";

type User = {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  role: string;
  avatarUrl?: string;
};

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("Failed to fetch profile");

        const json = await res.json();
        setUser(json.data);
        setFullName(json.data.fullName);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const fd = new FormData();
      fd.append("fullName", fullName);
      if (avatar) fd.append("avatar", avatar);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/me`,
        {
          method: "PUT",
          credentials: "include",
          body: fd,
        }
      );

      if (!res.ok) throw new Error("Failed to update profile");

      const json = await res.json();
      setUser(json.data);
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-500">Loading profile…</div>;
  }

  if (!user) {
    return <div className="p-10 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1a4fc7]">
            My Profile
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your personal information
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">

          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={
                  user.avatarUrl
                    ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatarUrl}`
                    : "/avatar-placeholder.png"
                }
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border"
              />
            </div>

            <div>
              <p className="font-semibold text-gray-800">{user.fullName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                value={user.email}
                disabled
                className="w-full rounded-lg border bg-gray-100 px-4 py-2 text-gray-600"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <input
                value={user.username}
                disabled
                className="w-full rounded-lg border bg-gray-100 px-4 py-2 text-gray-600"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-[#1a4fc7] focus:outline-none"
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                className="text-sm text-gray-600"
              />
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="
                  px-6 py-2 rounded-full
                  bg-[#1a4fc7] text-white font-medium
                  hover:bg-[#143fa3]
                  transition
                  disabled:opacity-60
                "
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>

              {success && (
                <span className="text-green-600 text-sm">
                  {success}
                </span>
              )}

              {error && (
                <span className="text-red-600 text-sm">
                  {error}
                </span>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
