"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../component/Header";
import { addToCart } from "../../../../lib/cart";
import { money } from "../../../../lib/money";
import { toggleWishlist, isWishlisted } from "../../../../lib/wishlist";
import { apiFetch } from "../../../../lib/api";
import { getBookImage } from "../../../../lib/book-placeholder";

type Book = {
  _id: string;
  title: string;
  author: string;
  category?: string;
  isbn?: string;
  price: number;
  stock: number;
  description?: string;
  coverUrl?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function BookDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishTick, setWishTick] = useState(0);
  const saved = useMemo(() => (book ? isWishlisted(book._id) : false), [book, wishTick]);
  const inStock = useMemo(() => (book ? book.stock > 0 : false), [book]);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setError("");
      try {
        const json = await apiFetch<any>(`/api/books/${id}`);
        const b = json?.data || json;
        if (!ignore) setBook(b);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Error loading book");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (id) run();
    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8fc]">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">
            Loading book...
          </div>
        </main>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#f6f8fc]">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-red-600 font-semibold">{error || "Book not found"}</p>
            <Link
              href="/user/books"
              className="text-sm text-[#1a4fc7] font-semibold hover:underline mt-3 inline-block"
            >
              ← Back to Books
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const imageUrl = getBookImage(
    book.coverUrl,
    API_BASE,
    book.title,
    book.author,
    book.category
  );

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <Link href="/user/books" className="text-sm text-[#1a4fc7] font-semibold hover:underline">
          ← Back to Books
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative h-[440px] bg-[#f2f5fb]">
              <div className="absolute left-0 top-0 h-full w-3 bg-gradient-to-b from-black/10 to-black/0" />
              <img
                src={imageUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-4 right-4">
                <span
                  className={
                    "text-[11px] px-2.5 py-1 rounded-full font-bold shadow-sm border bg-white/90 " +
                    (inStock ? "text-gray-900 border-gray-200" : "text-red-600 border-red-200")
                  }
                >
                  {inStock ? "Available" : "Out of stock"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-bold tracking-wide text-[#1a4fc7] uppercase">Book Details</p>

            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-gray-900">{book.title}</h1>
            <p className="text-gray-500 mt-1">by {book.author}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {book.category && (
                <span className="bg-[#f2f5fb] px-3 py-1 text-xs rounded-full font-semibold text-gray-700">
                  {book.category}
                </span>
              )}
              {book.isbn && (
                <span className="bg-[#f2f5fb] px-3 py-1 text-xs rounded-full font-semibold text-gray-700">
                  ISBN: {book.isbn}
                </span>
              )}
            </div>

            <div className="mt-6 rounded-2xl border border-gray-100 bg-[#fbfcff] p-4">
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-3xl font-black text-gray-900">{money(book.price)}</p>

              <p className="text-sm text-gray-500 mt-2">
                Stock: <span className="font-semibold text-gray-900">{book.stock}</span>
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-sm font-bold text-gray-900">Description</h2>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {book.description || "No description available."}
              </p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() =>
                  addToCart({
                    bookId: book._id,
                    title: book.title,
                    price: book.price,
                    coverUrl: imageUrl,
                  })
                }
                disabled={!inStock}
                className="flex-1 px-6 py-3 bg-[#1a4fc7] text-white rounded-2xl font-bold hover:brightness-95 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {inStock ? "Add to Reading Bag" : "Unavailable"}
              </button>

              <button
                type="button"
                onClick={() => {
                  toggleWishlist({
                    bookId: book._id,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    category: book.category,
                    coverUrl: imageUrl,
                  });
                  setWishTick((x) => x + 1);
                }}
                className="flex-1 text-center px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition"
              >
                {saved ? "Saved" : "Save"}
              </button>
            </div>

            <Link
              href="/user/cart"
              className="block mt-3 text-center px-6 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition"
            >
              Go to Cart →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}