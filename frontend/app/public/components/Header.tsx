"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getCartCount } from "../../../lib/cart";
// import { getCartCount } from "@/lib/cart";

export default function Header() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function updateCart() {
      setCartCount(getCartCount());
    }

    updateCart();

    window.addEventListener("cartUpdated", updateCart);

    return () => {
      window.removeEventListener("cartUpdated", updateCart);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  const nav = [
    { label: "Dashboard", href: "/user/dashboard" },
    { label: "Books", href: "/user/books" },
    { label: "Cart", href: "/user/cart" },
    { label: "Profile", href: "/user/profile" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/user/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1a4fc7] text-white flex items-center justify-center font-black">
            B
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">BODH</p>
            <p className="text-xs text-gray-500 -mt-0.5">Bookstore</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">

          {nav.map((n) => {
            const active = pathname?.startsWith(n.href);

            return (
              <Link
                key={n.href}
                href={n.href}
                className={
                  "relative px-4 py-2 rounded-xl text-sm font-semibold transition " +
                  (active
                    ? "bg-[#f2f5fb] text-[#1a4fc7]"
                    : "text-gray-700 hover:bg-gray-50")
                }
              >
                {n.label}

                {/* CART BADGE */}
                {n.label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#1a4fc7] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#1a4fc7] text-[#1a4fc7] hover:bg-[#1a4fc7] hover:text-white transition"
          >
            Logout
          </button>

        </nav>
      </div>
    </header>
  );
}