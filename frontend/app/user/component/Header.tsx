"use client";

import Link from "next/link";

export default function Header() {
  const handleLogout = () => {
    // UI-only logout (no backend yet)
    window.location.href = "/auth/login";
  };

  return (
    <header
      className="
        sticky top-0 z-40 w-full
        bg-white/80 backdrop-blur-2xl
        border-b border-gray-200
        shadow-sm
      "
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Brand */}
        <Link
          href="/user/dashboard"
          className="text-2xl font-bold tracking-wide text-[#1a4fc7]"
        >
          BODH
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8 font-medium text-gray-700">
          <Link
            href="/user/dashboard"
            className="hover:text-[#1a4fc7] transition"
          >
            Dashboard
          </Link>

          <Link
            href="/user/profile"
            className="hover:text-[#1a4fc7] transition"
          >
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="
              px-4 py-2 rounded-full
              border border-[#1a4fc7]
              text-[#1a4fc7]
              hover:bg-[#1a4fc7]
              hover:text-white
              transition
            "
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
