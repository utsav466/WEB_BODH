"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../component/Header";
import { CartItem, clearCart, getCart, cartTotals } from "../../../lib/cart";
import { money } from "../../../lib/money";
import { apiFetch } from "../../../lib/api";

type PaymentMethod = "COD" | "ESEWA";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [placing, setPlacing] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setItems(getCart());
  }, []);

  const { subtotal } = useMemo(() => cartTotals(items), [items]);
  const shipping = useMemo(() => (subtotal > 1500 ? 0 : 150), [subtotal]);
  const total = subtotal + shipping;

  const empty = items.length === 0;

  function submitEsewaForm(paymentUrl: string, payload: Record<string, any>) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.entries(payload).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = String(v);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  async function placeOrder() {
    try {
      setErr("");

      const token = localStorage.getItem("token");
      if (!token) {
        setErr("Please login first to place an order.");
        return;
      }

      if (!customerName.trim()) {
        setErr("Please enter your name.");
        return;
      }

      if (empty) {
        setErr("Your cart is empty.");
        return;
      }

      setPlacing(true);

      // 1) Create order
      const createRes = await apiFetch<any>("/api/orders", {
        method: "POST",
        auth: true,
body: JSON.stringify({
  customerName: customerName.trim(),
  customerEmail: customerEmail.trim(),
  paymentMethod,
  shippingAmount: shipping, // ✅ ADD THIS
  items: items.map((it) => ({
    bookId: it.bookId,
    title: it.title,
    price: it.price,
    qty: it.qty,
  })),
}),
      });

      const orderId = createRes?.data?._id;

      // 2) COD: finish
      if (paymentMethod === "COD") {
        clearCart();
        setItems([]);
        window.location.href = orderId ? `/user/orders/${orderId}` : "/user/orders";
        return;
      }

      // 3) eSewa: init -> get paymentUrl + payload, then POST form
      const payRes = await apiFetch<any>("/api/payments/esewa/init", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ orderId }),
      });

      if (!payRes?.paymentUrl || !payRes?.payload) {
        throw new Error("Invalid eSewa init response");
      }

      submitEsewaForm(payRes.paymentUrl, payRes.payload);
    } catch (e: any) {
      setErr(e?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Checkout</h1>
            <p className="text-sm text-gray-500">
              Choose payment and place your order.
            </p>
          </div>

          <Link
            href="/user/cart"
            className="text-sm font-semibold text-[#1a4fc7] hover:underline"
          >
            ← Back to Cart
          </Link>
        </div>

        {err && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100">
            <p className="text-sm font-semibold text-red-600">{err}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <section className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold">Customer Info</h2>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Full Name
                </label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1a4fc7]"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Email (optional)
                </label>
                <input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1a4fc7]"
                  placeholder="you@email.com"
                />
              </div>
            </div>

            <h2 className="text-base font-semibold mt-8">Payment Method</h2>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={
                  "p-4 rounded-2xl border text-left transition " +
                  (paymentMethod === "COD"
                    ? "border-[#1a4fc7] bg-[#f2f5fb]"
                    : "border-gray-200 bg-white hover:bg-gray-50")
                }
              >
                <p className="text-sm font-bold text-gray-900">
                  Cash on Delivery
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Pay when the books arrive.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("ESEWA")}
                className={
                  "p-4 rounded-2xl border text-left transition " +
                  (paymentMethod === "ESEWA"
                    ? "border-[#1a4fc7] bg-[#f2f5fb]"
                    : "border-gray-200 bg-white hover:bg-gray-50")
                }
              >
                <p className="text-sm font-bold text-gray-900">eSewa (Demo)</p>
                <p className="text-xs text-gray-500 mt-1">
                  Redirect to eSewa test environment.
                </p>
              </button>
            </div>

            <h2 className="text-base font-semibold mt-8">Items</h2>

            {empty ? (
              <div className="mt-4 text-sm text-gray-600">
                Your cart is empty.{" "}
                <Link
                  href="/user/books"
                  className="text-[#1a4fc7] font-semibold hover:underline"
                >
                  Browse books
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {items.map((it) => (
                  <div key={it.bookId} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {it.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {it.qty} × {money(it.price)}
                      </p>
                    </div>
                    <p className="text-sm font-bold">{money(it.price * it.qty)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right */}
          <aside className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h2 className="text-base font-semibold">Order Summary</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">{money(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? "Free" : money(shipping)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-semibold">{money(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              disabled={placing || empty}
              className="w-full mt-6 px-4 py-3 rounded-xl bg-[#ff9f24] text-[#0b1e4a] font-bold hover:brightness-95 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {placing
                ? "Processing..."
                : paymentMethod === "COD"
                ? "Place COD Order"
                : "Pay with eSewa (Demo)"}
            </button>

            <Link
              href="/user/books"
              className="block mt-3 text-center px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Continue Shopping
            </Link>
          </aside>
        </div>
      </main>
    </div>
  );
}