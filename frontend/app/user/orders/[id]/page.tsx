"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../component/Header";
import Link from "next/link";
import { money } from "../../../../lib/money";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function run() {
      try {
        setLoading(true);
        setErr("");

        const token = getToken();
        const res = await fetch(`${API_BASE}/api/orders/${id}`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || "Failed to load order");

        setOrder(json.data);
      } catch (e: any) {
        setErr(e?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }

    if (id) run();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-gray-900">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
        <Link href="/user/orders" className="text-sm text-[#1a4fc7] font-semibold hover:underline">
          ← Back to Orders
        </Link>

        {loading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">
            Loading order...
          </div>
        )}

        {!loading && err && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-600">{err}</p>
          </div>
        )}

        {!loading && !err && order && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h1 className="text-xl font-extrabold">Order #{String(order._id).slice(-6).toUpperCase()}</h1>
            <p className="text-sm text-gray-500 mt-1">{new Date(order.createdAt).toLocaleString()}</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#fbfcff] border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Order Status</p>
                <p className="font-bold">{order.status}</p>
              </div>
              <div className="rounded-xl bg-[#fbfcff] border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="font-bold">{order.paymentMethod === "COD" ? "Cash on Delivery" : "eSewa"}</p>
              </div>
              <div className="rounded-xl bg-[#fbfcff] border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Payment Status</p>
                <p className="font-bold">{order.paymentStatus}</p>
                {order.paymentRef ? <p className="text-xs text-gray-500 mt-1">Ref: {order.paymentRef}</p> : null}
              </div>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="text-sm font-bold">Items</p>
              <div className="mt-3 space-y-2">
                {order.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{it.title} × {it.qty}</span>
                    <span className="font-semibold">{money(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">{money(order.shippingAmount || 0)}</span>
              </div>

              <div className="mt-2 flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-extrabold">{money(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}