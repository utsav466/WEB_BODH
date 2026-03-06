"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../../component/Header";

export default function PaymentFailedPage() {
  const sp = useSearchParams();
  const reason = sp.get("reason");

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-gray-900">Payment Failed</p>
          <p className="text-sm text-gray-500 mt-2">
            Your eSewa demo payment did not complete.
          </p>

          {reason && (
            <p className="text-xs text-gray-400 mt-3">Reason: {reason}</p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/user/checkout"
              className="px-5 py-3 rounded-xl bg-[#1a4fc7] text-white font-semibold hover:brightness-95 transition"
            >
              Try Again
            </Link>

            <Link
              href="/user/cart"
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}