"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../component/Header";
import Link from "next/link";
import { money } from "../../../lib/money";

type OrderItem = {
  title: string;
  price: number;
  qty: number;
};

type Order = {
  _id: string;
  customerName: string;
  customerEmail?: string;
  items: OrderItem[];
  shippingAmount: number;
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: "COD" | "ESEWA";
  paymentStatus: "Unpaid" | "Pending" | "Paid" | "Failed";
  paymentRef?: string;
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setLoading(true);
      setErr("");

      const token = getToken();
      const res = await fetch(`${API_BASE}/api/orders/me`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to load orders");

      setOrders(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const empty = useMemo(() => !loading && !err && orders.length === 0, [loading, err, orders.length]);

  async function cancelOrder(id: string) {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/orders/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to cancel order");
      await load();
    } catch (e: any) {
      alert(e?.message || "Cancel failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Your Orders</h1>
            <p className="text-sm text-gray-500">Track delivery and payment status.</p>
          </div>

          <Link
            href="/user/books"
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Continue Shopping →
          </Link>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">
            Loading orders...
          </div>
        )}

        {!loading && err && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-600">{err}</p>
            <p className="text-xs text-gray-500 mt-2">
              If you just logged in, refresh once. Make sure your token exists in localStorage.
            </p>
          </div>
        )}

        {empty && (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <p className="text-lg font-semibold">No orders yet</p>
            <p className="text-sm text-gray-500 mt-1">Place your first order from the cart.</p>
            <Link
              href="/user/cart"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-[#1a4fc7] text-white font-semibold hover:brightness-95 transition"
            >
              Go to Cart →
            </Link>
          </div>
        )}

        {!loading && !err && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      Order #{o._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed: {new Date(o.createdAt).toLocaleString()}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge kind="status" value={o.status} />
                      <Badge kind="pm" value={o.paymentMethod} />
                      <Badge kind="ps" value={o.paymentStatus} />
                    </div>
                  </div>

                  <div className="md:text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-extrabold text-gray-900">{money(o.totalAmount)}</p>
                    {o.paymentMethod === "ESEWA" && o.paymentRef ? (
                      <p className="text-[11px] text-gray-500 mt-1">Ref: {o.paymentRef}</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Items</p>
                  <div className="space-y-2">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-800">
                          {it.title} <span className="text-gray-400">× {it.qty}</span>
                        </span>
                        <span className="font-semibold text-gray-900">{money(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-gray-800">{money(o.shippingAmount || 0)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/user/orders/${o._id}`}
                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    View Details
                  </Link>

                  {o.status !== "Cancelled" && o.status !== "Shipped" && o.status !== "Delivered" && (
                    <button
                      type="button"
                      onClick={() => cancelOrder(o._id)}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition"
                    >
                      Cancel Order (demo)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Badge({
  kind,
  value,
}: {
  kind: "status" | "pm" | "ps";
  value: string;
}) {
  let text = value;

  // prettier labels
  if (kind === "pm") text = value === "COD" ? "Cash on Delivery" : "eSewa";
  if (kind === "ps") {
    if (value === "Unpaid" && kind === "ps") text = "Unpaid";
    if (value === "Pending") text = "Payment Pending";
    if (value === "Paid") text = "Paid";
    if (value === "Failed") text = "Payment Failed";
  }

  const cls =
    "text-[11px] px-2.5 py-1 rounded-full font-bold border";

  if (kind === "status") {
    const map: Record<string, string> = {
      Pending: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]",
      Processing: "bg-[#eef2ff] text-[#3730a3] border-[#c7d2fe]",
      Shipped: "bg-[#ecfeff] text-[#155e75] border-[#a5f3fc]",
      Delivered: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]",
      Cancelled: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
    };
    return <span className={`${cls} ${map[value] || "bg-gray-50 text-gray-700 border-gray-200"}`}>{text}</span>;
  }

  if (kind === "pm") {
    return (
      <span className={`${cls} bg-[#f2f5fb] text-gray-800 border-gray-200`}>
        {text}
      </span>
    );
  }

  // payment status
  const psMap: Record<string, string> = {
    Unpaid: "bg-gray-50 text-gray-700 border-gray-200",
    Pending: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]",
    Paid: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]",
    Failed: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
  };

  return <span className={`${cls} ${psMap[value] || "bg-gray-50 text-gray-700 border-gray-200"}`}>{text}</span>;
}