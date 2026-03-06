"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "../../component/Header";

export default function PaymentSuccessPage() {
  const sp = useSearchParams();
  const orderId = sp.get("orderId");

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <p className="text-2xl font-extrabold text-gray-900">
            Payment Successful
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your eSewa demo payment was completed.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {orderId && (
              <Link
                href={`/user/orders/${orderId}`}
                className="px-5 py-3 rounded-xl bg-[#1a4fc7] text-white font-semibold hover:brightness-95 transition"
              >
                View Order
              </Link>
            )}

            <Link
              href="/user/orders"
              className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              My Orders
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}