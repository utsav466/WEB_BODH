"use client";

import React, { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

type UserMe = {
  _id: string;
  fullName: string;
  email: string;
  preferredCurrency?: "USD" | "NPR" | "INR";
  role: string;
};

export default function SettingsPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    preferredCurrency: "USD" as "USD" | "NPR" | "INR",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setErrMsg("");
      setOkMsg("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setErrMsg("No token found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Failed to load profile");

        const user: UserMe = json.data;

        if (!ignore) {
          setForm({
            fullName: user.fullName || "",
            email: user.email || "",
            preferredCurrency: (user.preferredCurrency as any) || "USD",
          });
        }
      } catch (e: any) {
        if (!ignore) setErrMsg(e?.message || "Failed to load settings");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg("");
    setOkMsg("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrMsg("No token found. Please login again.");
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE}/api/users/me`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to update settings");

      // optional: keep user cached in localStorage for quick UI usage
      localStorage.setItem("user", JSON.stringify(json.data));

      setOkMsg("Settings updated successfully ✅");
    } catch (e: any) {
      setErrMsg(e?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500">Update admin profile and currency.</p>
      </div>

      {errMsg && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
          <p className="text-sm font-semibold text-red-600">{errMsg}</p>
        </div>
      )}

      {okMsg && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-700">{okMsg}</p>
        </div>
      )}

      <form onSubmit={onSave} className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <Field
          label="Admin Name"
          value={form.fullName}
          onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
        />

        <Field
          label="Admin Email"
          value={form.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))}
        />

        <div>
          <label className="block text-sm font-semibold text-gray-800">Currency</label>
          <select
            value={form.preferredCurrency}
            onChange={(e) =>
              setForm((p) => ({ ...p, preferredCurrency: e.target.value as any }))
            }
            className="mt-2 w-full bg-[#f2f5fb] rounded-xl px-4 py-3 text-sm text-gray-700 outline-none"
          >
            <option value="USD">USD</option>
            <option value="NPR">NPR</option>
            <option value="INR">INR</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={
            "px-5 py-2.5 rounded-xl font-semibold shadow-sm transition " +
            (saving
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-[#ff9f24] text-[#0b1e4a] hover:brightness-95")
          }
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <p className="text-xs text-gray-500">
          * This saves directly to MongoDB (User document).
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1a4fc7]"
      />
    </div>
  );
}