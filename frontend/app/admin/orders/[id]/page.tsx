"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { money } from "../../../../lib/money";
// import { money } from "@/lib/money";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

type OrderItem = {
  bookId?: string;
  title: string;
  price: number;
  qty: number;
};

type Order = {
  _id: string;
  customerName: string;
  customerEmail?: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id ?? "";

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>("Pending");
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchOrder() {
    setLoading(true);
    setErrMsg("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");

      const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to load order");

      const data = json.data as Order;
      setOrder(data);
      setStatus(data.status);
    } catch (e: any) {
      setErrMsg(e?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orderId) fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const subtotal = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((sum, it) => sum + (it.qty || 0) * (it.price || 0), 0);
  }, [order]);

  // Demo-friendly shipping rule
  const shipping = useMemo(() => (subtotal > 40 ? 0 : 3.99), [subtotal]);
  const total = subtotal + shipping;

  async function onSaveStatus() {
    if (!order) return;

    try {
      setSaving(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");

      const res = await fetch(`${API_BASE}/api/admin/orders/${order._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to update status");

      setOrder(json.data);
      router.push("/admin/orders");
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  async function onCancelOrder() {
    const ok = window.confirm("Cancel this order? This cannot be undone.");
    if (!ok) return;

    if (!order) return;

    try {
      setSaving(true);
      setStatus("Cancelled");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please login again.");

      const res = await fetch(`${API_BASE}/api/admin/orders/${order._id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Cancelled" }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to cancel order");

      setOrder(json.data);
    } catch (e: any) {
      alert(e?.message || "Failed to cancel order");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-sm text-gray-600">
        Loading order...
      </div>
    );
  }

  if (errMsg) {
    return (
      <div className="max-w-3xl bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Could not load order</h1>
        <p className="text-sm text-red-600 mt-2">{errMsg}</p>
        <Link
          href="/admin/orders"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Order Details</h1>
          <p className="text-sm text-gray-500">
            Order{" "}
            <span className="font-semibold text-gray-800">
              {order._id.slice(-6).toUpperCase()}
            </span>{" "}
            · {formatDate(order.createdAt)}
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="px-4 py-2 rounded-xl bg-white shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back to Orders
        </Link>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800">Status</h2>
          <p className="text-sm text-gray-500 mt-1">Update the order status.</p>

          <div className="mt-4 space-y-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full bg-[#f2f5fb] rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="flex items-center gap-2">
              <StatusPill status={status} />
              <span className="text-xs text-gray-500">
                Current: <span className="font-semibold text-gray-800">{order.status}</span>
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onSaveStatus}
                disabled={saving}
                className={
                  "flex-1 px-4 py-2.5 rounded-xl font-semibold shadow-sm transition " +
                  (saving
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#ff9f24] text-[#0b1e4a] hover:brightness-95")
                }
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={onCancelOrder}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800">Customer</h2>
          <p className="text-sm text-gray-500 mt-1">Contact info.</p>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p className="font-semibold text-gray-800">{order.customerName}</p>
            <p className="text-gray-600">{order.customerEmail || "—"}</p>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800">Totals</h2>
          <p className="text-sm text-gray-500 mt-1">Quick summary.</p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">{money(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-semibold text-gray-900">
                {shipping === 0 ? "Free" : money(shipping)}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-gray-900">{money(total)}</span>
            </div>

            <p className="text-xs text-gray-500">
              (DB totalAmount: <span className="font-semibold">{money(order.totalAmount)}</span>)
            </p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Items</h2>
          <span className="text-sm text-gray-500">{order.items.length} items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr className="border-b">
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4">Qty</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-0 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={it.title + idx} className="border-b last:border-none text-gray-700">
                  <td className="py-3 pr-4 font-semibold text-gray-800">{it.title}</td>
                  <td className="py-3 pr-4">{it.qty}</td>
                  <td className="py-3 pr-4">{money(it.price)}</td>
                  <td className="py-3 pr-0 text-right font-semibold text-gray-900">
                    {money(it.qty * it.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Tip: change status on top and click Save to show “working admin control” in your video.
        </div>
      </div>
    </div>
  );
}

/* Helpers */

function StatusPill({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    Pending: "bg-orange-100 text-orange-700",
    Processing: "bg-violet-100 text-violet-700",
    Shipped: "bg-blue-100 text-blue-700",
    Delivered: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={"text-xs px-3 py-1 rounded-full font-medium " + map[status]}>
      {status}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}