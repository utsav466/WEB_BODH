"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleLogin } from "../../../lib/actions/auth-action";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setErrorMessage("");

    try {
      const res = await handleLogin(formData);

      if (res.success) {
        // ✅ Cookies are set on the server action now
        router.push("/auth/user/dashboard");
        return;
      }

      setErrorMessage(res.message || "Login failed");
    } catch (err: any) {
      setErrorMessage(err?.message || "Login failed");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Login
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-sky-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-sky-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white rounded-full px-4 py-3 hover:bg-sky-600 transition font-semibold"
        >
          Login
        </button>
      </form>

      {errorMessage && (
        <p className="mt-4 text-red-600 text-center font-medium">
          {errorMessage}
        </p>
      )}

      <p className="mt-4 text-center text-sm">
        Don’t have an account?{" "}
        <Link href="/auth/register" className="text-sky-600 hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
