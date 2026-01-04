"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be 10 digits";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.confirmPassword !== formData.password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("Register form submitted:", formData);
    setSuccess(true);

    setTimeout(() => {
      router.push("/auth/login");
    }, 1500);
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
            className="w-full border border-sky-400 rounded-full px-4 py-3 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-sky-400 rounded-full px-4 py-3 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
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
            className="w-full border border-sky-400 rounded-full px-4 py-3 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            className="w-full border border-sky-400 rounded-full px-4 py-3 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            className="w-full border border-sky-400 rounded-full px-4 py-3 
                       focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white rounded-full px-4 py-3 
                     hover:bg-sky-600 transition font-semibold"
        >
          Sign Up
        </button>
      </form>

      {success && (
        <p className="mt-4 text-green-600 text-center font-medium">
          Signup successfully
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
