"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await new Promise((r) => setTimeout(r, 1000));
      if (!email || !password) throw new Error("Email and password are required");
      router.push("/auth/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Login to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-sky-400 px-4 py-3 text-gray-900 shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="name@mail.com"
              required
            />
          </div>

          {/* Password */}
          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-sky-400 px-4 py-3 text-gray-900 shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded text-sky-600 focus:ring-sky-500" />
              Remember me
            </label>
            <Link href="/auth/forgot" className="text-sky-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-blue-600 px-4 py-3 text-white font-semibold shadow 
                       hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Sign up prompt */}
        <p className="mt-6 text-sm text-gray-600 text-center">
          Not a member yet?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-sky-600 hover:text-sky-700"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
