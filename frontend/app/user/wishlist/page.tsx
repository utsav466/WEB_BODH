"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../component/Header";
import { money } from "../../../lib/money";
import { addToCart } from "../../../lib/cart";
import {
  WishlistItem,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
  WISHLIST_UPDATED_EVENT,
} from "../../../lib/wishlist";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    setItems(getWishlist());

    const update = () => setItems(getWishlist());
    window.addEventListener(WISHLIST_UPDATED_EVENT, update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener(WISHLIST_UPDATED_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const hay = `${it.title} ${it.author ?? ""} ${it.category ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [items, q]);

  const empty = items.length === 0;

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Wishlist</h1>
            <p className="text-sm text-gray-500">Saved books for later.</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-[340px] bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-2">
              <span className="text-gray-400">🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search wishlist..."
                className="w-full outline-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {!empty && (
              <button
                type="button"
                onClick={() => {
                  clearWishlist();
                  setItems([]);
                }}
                className="px-4 py-3 rounded-2xl bg-white border border-gray-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {empty ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center border border-gray-100">
            <p className="text-lg font-semibold text-gray-900">No saved books</p>
            <p className="text-sm text-gray-500 mt-1">
              Tap “Save” on any book to keep it here.
            </p>
            <Link
              href="/user/books"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-[#1a4fc7] text-white font-semibold hover:brightness-95 transition"
            >
              Browse Books →
            </Link>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
              saved book{filtered.length !== 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((it) => (
                <div
                  key={it.bookId}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-20 rounded-xl bg-[#f2f5fb] overflow-hidden shrink-0 flex items-center justify-center">
                      {it.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.coverUrl} alt={it.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold">No Cover</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/user/books/${it.bookId}`}
                        className="text-sm font-semibold text-gray-900 hover:text-[#1a4fc7] transition line-clamp-2"
                      >
                        {it.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {it.author ?? "Unknown author"}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-gray-900">
                          {money(it.price)}
                        </span>
                        {it.category && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-[#f2f5fb] text-gray-700 font-semibold">
                            {it.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart({
                          bookId: it.bookId,
                          title: it.title,
                          price: it.price,
                          coverUrl: it.coverUrl,
                        })
                      }
                      className="px-4 py-2.5 rounded-xl bg-[#1a4fc7] text-white font-bold hover:brightness-95 transition"
                    >
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        removeFromWishlist(it.bookId);
                        setItems(getWishlist());
                      }}
                      className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}