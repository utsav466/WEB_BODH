"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../component/Header";
import { getBookImage } from "../../../lib/book-placeholder";

/* ===============================
   Types
================================ */
type Book = {
  _id: string;
  title: string;
  author: string;
  category?: string;
  price: number;
  stock: number;
  coverUrl?: string;
};

type ApiResponse = {
  success: boolean;
  items: Book[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const [query, setQuery] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchBooks() {
      setLoading(true);
      setErrMsg("");

      try {
        const res = await fetch(`${API_BASE}/api/books?page=1&limit=18`, {
          cache: "no-store",
        });

        const json: ApiResponse = (await res.json().catch(() => ({
          success: false,
          items: [],
          page: 1,
          limit: 18,
          total: 0,
          totalPages: 1,
        }))) as ApiResponse;

        if (!res.ok || !json?.success) {
          throw new Error((json as any)?.message || "Failed to fetch books");
        }

        if (!ignore) {
          setBooks(Array.isArray(json.items) ? json.items : []);
        }
      } catch (e: any) {
        if (!ignore) setErrMsg(e?.message || "Failed to fetch books");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchBooks();
    return () => {
      ignore = true;
    };
  }, []);

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;

    return books.filter((b) => {
      const hay = `${b.title} ${b.author} ${b.category ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [books, query]);

  return (
    <div className="relative min-h-screen bg-[#f6f8fc] text-gray-900 overflow-hidden">
      {/* Light Gradient Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[520px] h-[520px]
                     bg-[#1a4fc7]/20 rounded-full blur-[140px] animate-mesh"
        />
        <div
          className="absolute bottom-[-15%] right-[-10%] w-[520px] h-[520px]
                     bg-purple-400/20 rounded-full blur-[140px] animate-mesh2"
        />
        <div
          className="absolute top-[30%] right-[20%] w-[420px] h-[420px]
                     bg-cyan-400/20 rounded-full blur-[140px] animate-mesh3"
        />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="px-6 py-14 max-w-7xl mx-auto">
          {/* HERO */}
          <section
            className="
              relative mb-12 rounded-3xl
              px-10 py-16 md:px-14 md:py-20
              bg-white/70 backdrop-blur-2xl
              border border-white/60
              shadow-[0_30px_90px_rgba(0,0,0,0.12)]
            "
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl">
              Discover books that
              <span className="text-[#1a4fc7]"> expand your thinking</span>
            </h1>

            <p className="mt-4 text-gray-600 max-w-2xl text-lg">
              A curated digital bookstore for focused readers, learners, and creators. Thoughtful reads — no noise.
            </p>

            {/* Search Bar */}
            <div className="mt-10 max-w-xl">
              <div
                className="
                  flex items-center gap-3
                  bg-white/80 backdrop-blur-xl
                  border border-gray-200
                  rounded-full px-6 py-4
                  shadow-lg
                "
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search books, authors, categories..."
                  className="
                    w-full bg-transparent outline-none
                    text-gray-900 placeholder-gray-400
                  "
                />
                <button
                  type="button"
                  onClick={() => setQuery((q) => q.trim())}
                  className="
                    text-sm font-semibold
                    px-5 py-2 rounded-full
                    bg-[#1a4fc7]
                    text-white
                    hover:bg-[#163fa3]
                    transition
                  "
                >
                  Search
                </button>
              </div>

              {!!query.trim() && (
                <div className="mt-3 text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredBooks.length}
                  </span>{" "}
                  result(s)
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="ml-3 text-[#1a4fc7] font-semibold hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Books Grid */}
          <section>
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Recommended for You</h2>
                <p className="text-sm text-gray-500">
                  Pulled from your backend (API: /api/books)
                </p>
              </div>
            </div>

            {loading && <p className="text-gray-500">Loading books...</p>}

            {!loading && errMsg && (
              <div className="bg-white rounded-2xl border border-red-200 p-5">
                <p className="text-sm text-red-700 font-semibold">{errMsg}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Make sure backend is running on{" "}
                  <span className="font-semibold">{API_BASE}</span>
                </p>
              </div>
            )}

            {!loading && !errMsg && filteredBooks.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-sm font-semibold text-gray-900">No books found</p>
                <p className="text-xs text-gray-500 mt-1">Try a different search.</p>
              </div>
            )}

            {!loading && !errMsg && filteredBooks.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

/* ===============================
   Book Card
================================ */
function BookCard({ book }: { book: Book }) {
  const cover = getBookImage(
    book.coverUrl,
    API_BASE,
    book.title,
    book.author,
    book.category
  );

  return (
    <div
      className="
        rounded-2xl overflow-hidden
        bg-white/80 backdrop-blur-xl
        border border-gray-200
        shadow-md hover:shadow-xl
        hover:-translate-y-1 transition-all duration-300
      "
    >
      <div className="h-52 bg-[#f2f5fb]">
        <img
          src={cover}
          alt={book.title}
          className="h-52 w-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{book.author}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1a4fc7]">
            Rs {Number(book.price || 0).toFixed(2)}
          </span>

          <span
            className={
              "text-[11px] px-2.5 py-1 rounded-full font-semibold " +
              (book.stock > 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700")
            }
          >
            {book.stock > 0 ? `In Stock (${book.stock})` : "Out of Stock"}
          </span>
        </div>
      </div>
    </div>
  );
}