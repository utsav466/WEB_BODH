"use client";

import { useEffect, useState } from "react";
import Header from "../component/Header";

/* ===============================
   Book Type
================================ */
type Book = {
  key: string;
  title: string;
  cover_i?: number;
  author_name?: string[];
};

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch(
          "https://openlibrary.org/search.json?q=programming&limit=10"
        );
        const data = await res.json();
        setBooks(data.docs);
      } catch (err) {
        console.error("Failed to fetch books", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f6f8fc] text-gray-900 overflow-hidden">

      {/* ===============================
          Light Gradient Mesh
      ================================ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[520px] h-[520px]
                        bg-[#1a4fc7]/20 rounded-full blur-[140px] animate-mesh" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[520px] h-[520px]
                        bg-purple-400/20 rounded-full blur-[140px] animate-mesh2" />
        <div className="absolute top-[30%] right-[20%] w-[420px] h-[420px]
                        bg-cyan-400/20 rounded-full blur-[140px] animate-mesh3" />
      </div>

      {/* ===============================
          Content
      ================================ */}
      <div className="relative z-10">
        <Header />

        <main className="px-6 py-14 max-w-7xl mx-auto">

          {/* ===============================
              HERO SECTION
          ================================ */}
          <section
            className="
              relative mb-24 rounded-3xl
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
              A curated digital bookstore for focused readers, learners,
              and creators. Thoughtful reads — no noise.
            </p>

            {/* ===============================
                Search Bar
            ================================ */}
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
                  placeholder="Search books, authors, topics..."
                  className="
                    w-full bg-transparent outline-none
                    text-gray-900 placeholder-gray-400
                  "
                />
                <button
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
            </div>
          </section>

          {/* ===============================
              Recommended Books
          ================================ */}
          <section>
            <h2 className="text-xl font-semibold mb-6">
              Recommended for You
            </h2>

            {loading ? (
              <p className="text-gray-500">Loading books...</p>
            ) : (
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-6">
                {books.map((book) => {
                  const coverURL = book.cover_i
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
                    : "/images/placeholder_book.png";

                  return (
                    <div
                      key={book.key}
                      className="
                        min-w-[180px]
                        rounded-2xl p-4
                        bg-white/80 backdrop-blur-xl
                        border border-gray-200
                        shadow-md
                        hover:shadow-xl
                        hover:-translate-y-1
                        transition-all duration-300
                      "
                    >
                      <img
                        src={coverURL}
                        alt={book.title}
                        className="h-56 w-full object-cover rounded-xl mb-4"
                      />

                      <h3 className="text-sm font-semibold line-clamp-2">
                        {book.title}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {book.author_name?.[0] || "Unknown Author"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
