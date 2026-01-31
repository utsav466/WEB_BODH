"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleRegister } from "../../../lib/actions/auth-action";

type RegisterFormData = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegisterResponse = {
  success?: boolean;
  token?: string;
  message?: string;
};

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Clear messages as user edits
    setErrorMessage("");
    setSuccessMessage("");

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.username.trim()) newErrors.username = "Username is required";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Confirm password is required";
    else if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages before validating/submitting
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const res = (await handleRegister(formData)) as RegisterResponse;

      // Treat success as true ONLY if explicitly true OR token exists
      const isSuccess = res?.success === true || Boolean(res?.token);

      if (isSuccess) {
        if (res?.token) localStorage.setItem("token", res.token);

        setErrors({});
        setErrorMessage("");
        setSuccessMessage(res?.message || "Registration successful");

        // Let the user see the green message, then navigate
        setTimeout(() => {
          router.push("/auth/login");
        }, 1200);
      } else {
        setSuccessMessage("");
        setErrorMessage(res?.message || "Registration failed");
      }
    } catch (err: any) {
      setSuccessMessage("");
      setErrorMessage(
        err?.response?.data?.message || err?.message || "Registration failed"
      );
      console.error("Register error:", err?.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Sign Up
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border border-sky-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-sky-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        {/* Email */}
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

        {/* Password */}
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

        {/* Confirm Password */}
        <div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-sky-400 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white rounded-full px-4 py-3 hover:bg-sky-600 transition font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

      {/* Messages */}
      {errorMessage && (
        <p className="mt-4 text-red-600 text-center font-medium">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="mt-4 text-green-600 text-center font-medium">
          {successMessage}
        </p>
      )}

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-sky-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
