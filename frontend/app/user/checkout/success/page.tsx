"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../../component/Header";

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();
  const orderId = sp.get("orderId") || "BODH-ORDER";

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-gray-900">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#f2f5fb] mx-auto flex items-center justify-center text-2xl">
            ✅
          </div>

          <h1 className="mt-5 text-2xl font-extrabold">Order Placed</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your order has been created successfully.
          </p>

          <div className="mt-6 rounded-xl bg-[#fbfcff] border border-gray-100 p-4">
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="text-base font-extrabold text-gray-900">{orderId}</p>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/user/books"
              className="px-5 py-3 rounded-xl bg-[#1a4fc7] text-white font-bold hover:brightness-95 transition"
            >
              Continue Browsing →
            </Link>
            <Link
              href="/user/dashboard"
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}