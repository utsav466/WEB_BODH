"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../component/Header";
import { addToCart } from "../../../lib/cart";
import { money } from "../../../lib/money";
import { toggleWishlist, isWishlisted } from "../../../lib/wishlist";
import { apiFetch } from "../../../lib/api";
import { getBookImage } from "../../../lib/book-placeholder";

type Book = {
  _id: string;
  title: string;
  author: string;
  category?: string;
  isbn?: string;
  price: number;
  stock: number;
  status?: string;
  description?: string;
  coverUrl?: string;
  createdAt?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function UserBooksPage() {
  const [items, setItems] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [wishTick, setWishTick] = useState(0);

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState(q);
  const [cat, setCat] = useState<string>("All");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setErrMsg("");

      try {
        const json = await apiFetch<{ items: Book[] }>("/api/books");
        if (!ignore) setItems(Array.isArray(json.items) ? json.items : []);
      } catch (e: any) {
        if (!ignore) setErrMsg(e?.message || "Failed to load books");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((b) => {
      if (b.category && b.category.trim()) set.add(b.category.trim());
    });
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [items]);

  const filtered = useMemo(() => {
    const s = debouncedQ.trim().toLowerCase();

    return items.filter((b) => {
      const matchCat = cat === "All" ? true : (b.category || "") === cat;
      if (!matchCat) return false;

      if (!s) return true;
      const hay = `${b.title} ${b.author} ${b.category ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [items, debouncedQ, cat]);

  const topPicks = useMemo(() => {
    return [...filtered]
      .filter((b) => b.stock > 0)
      .sort((a, b) => (b.price || 0) - (a.price || 0))
      .slice(0, 6);
  }, [filtered, wishTick]);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-gray-900">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-bold tracking-wide text-[#1a4fc7] uppercase">
                Discover your next read
              </p>
              <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-gray-900">
                A curated shelf for curious minds.
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Search by title, author, or category. Add to cart in one click and
                keep building your reading bag.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full bg-[#f2f5fb] text-gray-700 font-semibold">
                  Fast Search
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-[#f2f5fb] text-gray-700 font-semibold">
                  Clean Checkout
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-[#f2f5fb] text-gray-700 font-semibold">
                  LocalStorage Cart
                </span>
              </div>
            </div>

            <div className="w-full md:w-[440px] rounded-2xl border border-gray-100 bg-[#fbfcff] p-3">
              <div className="flex items-center gap-2 px-2">
                <span className="text-gray-400">🔎</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search title, author, category..."
                  className="w-full outline-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400"
                />
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {categories.map((c) => {
                  const active = c === cat;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCat(c)}
                      className={
                        "whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full border transition " +
                        (active
                          ? "bg-[#1a4fc7] text-white border-[#1a4fc7]"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
                      }
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="h-2 bg-gradient-to-r from-[#1a4fc7]/20 via-[#ff9f24]/20 to-[#1a4fc7]/20" />
        </section>

        {loading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">
            Loading books...
          </div>
        )}

        {!loading && errMsg && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-red-600 font-semibold">{errMsg}</p>
            <p className="text-xs text-gray-500 mt-2">
              Backend: <span className="font-semibold">{API_BASE}</span>
            </p>
          </div>
        )}

        {!loading && !errMsg && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">{filtered.length}</span>{" "}
                books
                {cat !== "All" && (
                  <>
                    {" "}
                    in <span className="font-semibold text-gray-900">{cat}</span>
                  </>
                )}
              </div>

              <Link
                href="/user/cart"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Go to Cart →
              </Link>
            </div>

            {topPicks.length > 0 && (
              <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Top Picks</h2>
                    <p className="text-xs text-gray-500">
                      A quick shelf of popular in-stock picks.
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-[#f2f5fb] text-gray-700 font-semibold">
                    {topPicks.length} picks
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topPicks.map((b) => (
                    <FeaturedRowCard
                      key={b._id}
                      book={b}
                      apiBase={API_BASE}
                      onWishTick={() => setWishTick((x) => x + 1)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">Catalog</h3>
                <p className="text-xs text-gray-500">Tap a book to view details.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filtered.map((b) => (
                  <BookCard
                    key={b._id}
                    book={b}
                    apiBase={API_BASE}
                    onWishTick={() => setWishTick((x) => x + 1)}
                  />
                ))}

                {filtered.length === 0 && (
                  <div className="col-span-full bg-white rounded-2xl p-8 shadow-sm text-center">
                    <p className="text-sm font-semibold text-gray-900">No books found</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try clearing search or select another category.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function BookCard({
  book,
  apiBase,
  onWishTick,
}: {
  book: Book;
  apiBase: string;
  onWishTick: () => void;
}) {
  const inStock = book.stock > 0;
  const saved = isWishlisted(book._id);
  const imageUrl = getBookImage(
    book.coverUrl,
    apiBase,
    book.title,
    book.author,
    book.category
  );

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
      <Link href={`/user/books/${book._id}`} className="block">
        <div className="relative h-60 bg-[#f2f5fb] overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-3 bg-gradient-to-b from-black/10 to-black/0" />

          <img
            src={imageUrl}
            alt={book.title}
            className="h-full w-full object-cover group-hover:scale-[1.02] transition"
          />

          <div className="absolute top-3 right-3">
            <span
              className={
                "text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm border " +
                (inStock
                  ? "bg-white/90 text-gray-900 border-gray-200"
                  : "bg-white/90 text-red-600 border-red-200")
              }
            >
              {inStock ? "Available" : "Out of stock"}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-2">
          <h3 className="text-sm font-extrabold text-gray-900 line-clamp-2 group-hover:text-[#1a4fc7] transition">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>

          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-black text-gray-900">{money(book.price)}</span>
            <span className="text-xs text-gray-500">
              Stock: <span className="font-semibold">{book.stock}</span>
            </span>
          </div>

          {book.category && (
            <div className="pt-1">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#f2f5fb] text-gray-700 font-semibold">
                {book.category}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="px-4 pb-4 flex gap-2">
        <button
          type="button"
          onClick={() =>
            addToCart({
              bookId: book._id,
              title: book.title,
              price: book.price,
              coverUrl: imageUrl,
            })
          }
          disabled={!inStock}
          className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-bold transition
          bg-[#1a4fc7] text-white hover:brightness-95 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {inStock ? "Add to Reading Bag" : "Unavailable"}
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist({
              bookId: book._id,
              title: book.title,
              author: book.author,
              price: book.price,
              category: book.category,
              coverUrl: imageUrl,
            });
            onWishTick();
          }}
          className="px-4 py-2.5 rounded-2xl text-sm font-bold transition
          bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function FeaturedRowCard({
  book,
  apiBase,
  onWishTick,
}: {
  book: Book;
  apiBase: string;
  onWishTick: () => void;
}) {
  const inStock = book.stock > 0;
  const saved = isWishlisted(book._id);
  const imageUrl = getBookImage(
    book.coverUrl,
    apiBase,
    book.title,
    book.author,
    book.category
  );

  return (
    <div className="rounded-2xl border border-gray-100 bg-[#fbfcff] p-4 flex gap-4">
      <Link
        href={`/user/books/${book._id}`}
        className="w-16 h-20 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0"
      >
        <img
          src={imageUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/user/books/${book._id}`}>
          <p className="text-sm font-extrabold text-gray-900 line-clamp-1 hover:text-[#1a4fc7] transition">
            {book.title}
          </p>
        </Link>
        <p className="text-xs text-gray-500 line-clamp-1">{book.author}</p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-black text-gray-900">{money(book.price)}</span>
          <span className="text-[11px] font-bold text-gray-600">
            {inStock ? "In Stock" : "Out"}
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() =>
              addToCart({
                bookId: book._id,
                title: book.title,
                price: book.price,
                coverUrl: imageUrl,
              })
            }
            disabled={!inStock}
            className="px-3 py-2 rounded-xl text-xs font-bold transition
            bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
            disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {inStock ? "Quick Add" : "Unavailable"}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist({
                bookId: book._id,
                title: book.title,
                author: book.author,
                price: book.price,
                category: book.category,
                coverUrl: imageUrl,
              });
              onWishTick();
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold transition
            bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}