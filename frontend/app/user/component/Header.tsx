"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCart, getCartCount, CartItem, cartTotals } from "../../../lib/cart";
import { money } from "../../../lib/money";

export default function Header() {
  const pathname = usePathname();

  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  const popRef = useRef<HTMLDivElement | null>(null);

  const nav = [
    { label: "Dashboard", href: "/user/dashboard" },
    { label: "Books", href: "/user/books" },
    { label: "Profile", href: "/user/profile" },
    { label: "Orders", href: "/user/orders" },
    { label: "Wishlist", href: "/user/wishlist" },
  ];

  const { subtotal } = useMemo(() => cartTotals(cartItems), [cartItems]);

  // refresh cart from localStorage
  const refreshCart = () => {
    const items = getCart();
    setCartItems(items);
    setCartCount(getCartCount());
  };

  useEffect(() => {
    refreshCart();

    const update = () => refreshCart();

    window.addEventListener("bodh_cart_updated", update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener("bodh_cart_updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  // close popover on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!open) return;
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  const isActive = (href: string) => pathname?.startsWith(href);

  const topItems = cartItems.slice(0, 3);
  const extraCount = Math.max(0, cartItems.length - topItems.length);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/user/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1a4fc7] text-white flex items-center justify-center font-black">
            B
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-gray-900">BODH</p>
            <p className="text-xs text-gray-500 -mt-0.5">Bookstore</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-3">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                "px-4 py-2 rounded-xl text-sm font-semibold transition " +
                (isActive(n.href)
                  ? "bg-[#f2f5fb] text-[#1a4fc7]"
                  : "text-gray-700 hover:bg-gray-50")
              }
            >
              {n.label}
            </Link>
          ))}

          {/* Unique Mini Cart */}
          <div className="relative" ref={popRef}>
            <button
              type="button"
              onClick={() => {
                refreshCart();
                setOpen((v) => !v);
              }}
              className="relative w-10 h-10 rounded-xl hover:bg-gray-100 transition flex items-center justify-center"
              aria-label="Cart"
            >
              {/* a slightly more unique icon feel: book + bag vibe */}
              <span className="text-lg">📚</span>

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff9f24] text-[#0b1e4a] text-xs font-bold px-1.5 py-0.5 rounded-full shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-[340px] rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Reading Bag</p>
                    <p className="text-xs text-gray-500 -mt-0.5">
                      {cartCount === 0 ? "No books added yet" : "Quick preview of your picks"}
                    </p>
                  </div>

                  <Link
                    href="/user/cart"
                    onClick={() => setOpen(false)}
                    className="text-xs font-semibold text-[#1a4fc7] hover:underline"
                  >
                    Open Cart
                  </Link>
                </div>

                {/* Body */}
                <div className="p-4">
                  {cartItems.length === 0 ? (
                    <div className="rounded-xl bg-[#f6f8fc] p-4 text-center">
                      <p className="text-sm font-semibold text-gray-900">Your bag is empty</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Add a book to start your next read.
                      </p>
                      <Link
                        href="/user/books"
                        onClick={() => setOpen(false)}
                        className="inline-block mt-3 px-4 py-2 rounded-xl bg-[#1a4fc7] text-white text-sm font-semibold hover:brightness-95 transition"
                      >
                        Explore Books →
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {topItems.map((it) => (
                          <div key={it.bookId} className="flex items-center gap-3">
                            <div className="w-10 h-12 rounded-lg bg-[#f2f5fb] overflow-hidden shrink-0 flex items-center justify-center">
                              {it.coverUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={it.coverUrl}
                                  alt={it.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] text-gray-400 font-semibold">
                                  No Cover
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {it.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {it.qty} × {money(it.price)}
                              </p>
                            </div>

                            <p className="text-sm font-bold text-gray-900">
                              {money((it.price || 0) * (it.qty || 0))}
                            </p>
                          </div>
                        ))}
                      </div>

                      {extraCount > 0 && (
                        <p className="text-xs text-gray-500 mt-3">
                          + {extraCount} more item{extraCount > 1 ? "s" : ""} in cart
                        </p>
                      )}

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-bold text-gray-900">{money(subtotal)}</span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Link
                            href="/user/cart"
                            onClick={() => setOpen(false)}
                            className="text-center px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                          >
                            View Cart
                          </Link>

                          <Link
                            href="/user/checkout"
                            onClick={() => setOpen(false)}
                            className="text-center px-4 py-2.5 rounded-xl bg-[#ff9f24] text-[#0b1e4a] font-semibold hover:brightness-95 transition"
                          >
                            Checkout
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
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