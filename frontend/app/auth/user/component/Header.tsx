"use client";

import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <header className="w-full bg-blue-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-2 py-1 flex items-center justify-between">
        {/* Logo / Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => router.push("/auth/user/dashboard")}
        >
          <img src="/logo_varient_2.png" alt="BODH Logo" className="h-25 w-25" />
          {/* <span className="text-xl font-semibold">Dashboard</span> */}
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          <button
            onClick={() => router.push("/auth/user/dashboard")}
            className="hover:text-blue-200 transition font-medium"
          >
            Home
          </button>
          <button
            onClick={() => router.push("/auth/user/dashboard/books")}
            className="hover:text-blue-200 transition font-medium"
          >
            My Books
          </button>
          <button
            onClick={() => router.push("/auth/user/dashboard/profile")}
            className="hover:text-blue-200 transition font-medium"
          >
            Profile
          </button>
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
