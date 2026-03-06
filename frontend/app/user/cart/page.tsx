"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "../component/Header";
import { CartItem, clearCart, getCart, removeFromCart, updateQty, cartTotals } from "../../../lib/cart";
import { money } from "../../../lib/money";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const { subtotal } = useMemo(() => cartTotals(items), [items]);
  const shipping = useMemo(() => (subtotal > 1500 ? 0 : 150), [subtotal]); // simple demo shipping
  const total = subtotal + shipping;

  const empty = items.length === 0;

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header Row */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>
            <p className="text-sm text-gray-500">
              Review items and proceed to checkout.
            </p>
          </div>

          {!empty && (
            <button
              onClick={() => {
                clearCart();
                setItems([]);
              }}
              className="px-4 py-2 rounded-xl bg-white shadow-sm text-sm font-semibold text-red-600 hover:bg-red-50 transition"
              type="button"
            >
              Clear Cart
            </button>
          )}
        </div>

        {empty ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <p className="text-lg font-semibold text-gray-900">Your cart is empty</p>
            <p className="text-sm text-gray-500 mt-1">
              Browse books and add something you like.
            </p>

            <Link
              href="/user/dashboard"
              className="inline-block mt-6 px-5 py-2.5 rounded-xl bg-[#1a4fc7] text-white font-semibold hover:brightness-95 transition"
            >
              Browse Books →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <section className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                // ✅ KEY FIX: ensure key is unique even if duplicates happen
                const key = `${item.bookId}`;

                return (
                  <div
                    key={key}
                    className="bg-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    {/* Cover */}
                    <div className="w-20 h-28 rounded-xl bg-[#f2f5fb] overflow-hidden shrink-0 flex items-center justify-center">
                      {item.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold">No Cover</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Price: <span className="font-semibold text-gray-800">{money(item.price)}</span>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        {/* Qty controls */}
                        <div className="flex items-center gap-2 bg-[#f2f5fb] rounded-xl px-3 py-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateQty(item.bookId, Math.max(1, item.qty - 1));
                              setItems(getCart());
                            }}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-gray-700 hover:bg-gray-50"
                          >
                            −
                          </button>

                          <span className="w-8 text-center font-semibold text-gray-900">
                            {item.qty}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              updateQty(item.bookId, item.qty + 1);
                              setItems(getCart());
                            }}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm font-bold text-gray-700 hover:bg-gray-50"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            removeFromCart(item.bookId);
                            setItems(getCart());
                          }}
                          className="text-sm font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="sm:text-right">
                      <p className="text-xs text-gray-500">Line Total</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {money(item.price * item.qty)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Summary */}
            <aside className="bg-white rounded-2xl p-6 shadow-sm h-fit">
              <h2 className="text-base font-semibold text-gray-900">Order Summary</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{money(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? "Free" : money(shipping)}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold text-gray-900">{money(total)}</span>
                </div>
              </div>

              <Link
                href="/user/checkout"
                className="block mt-6 text-center px-4 py-3 rounded-xl bg-[#ff9f24] text-[#0b1e4a] font-semibold hover:brightness-95 transition"
              >
                Proceed to Checkout →
              </Link>

              <Link
                href="/user/dashboard"
                className="block mt-3 text-center px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}