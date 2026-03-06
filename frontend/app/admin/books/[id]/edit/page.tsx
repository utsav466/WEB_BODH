"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type BookStatusUI = "Active" | "Draft" | "Out of Stock";

type BackendBook = {
  _id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string;
  price: number;
  stock: number;
  status: "active" | "draft";
  description?: string;
};

type FormState = {
  title: string;
  author: string;
  category: string;
  isbn: string;
  price: string;
  stock: string;
  status: BookStatusUI;
  description: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

function backendToUIStatus(b: BackendBook): BookStatusUI {
  if (Number(b.stock) <= 0) return "Out of Stock";
  return b.status === "draft" ? "Draft" : "Active";
}

function uiToBackendStatus(ui: BookStatusUI): { status: "active" | "draft"; stockOverride?: number } {
  // If admin selects Out of Stock, we keep backend status as active but stock 0.
  // (You can change this logic if your backend supports status="out_of_stock")
  if (ui === "Draft") return { status: "draft" };
  if (ui === "Out of Stock") return { status: "active", stockOverride: 0 };
  return { status: "active" };
}

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const bookId = params?.id ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  const [bookExists, setBookExists] = useState(true);

  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "",
    author: "",
    category: "",
    isbn: "",
    price: "",
    stock: "",
    status: "Draft",
    description: "",
  });

  // Fetch book from backend
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setServerError("");
      setBookExists(true);

      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/admin/books/${bookId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 404) {
          if (alive) setBookExists(false);
          return;
        }

        if (!res.ok) {
          throw new Error(data?.message || `Failed to load book (${res.status})`);
        }

        // Accept common response shapes:
        // { success:true, data: book } OR { success:true, book: book } OR book directly
        const b: BackendBook = data?.data || data?.book || data;

        const uiStatus = backendToUIStatus(b);

        if (!alive) return;

        setForm({
          title: b.title || "",
          author: b.author || "",
          category: b.category || "",
          isbn: b.isbn || "",
          price: String(b.price ?? ""),
          stock: String(b.stock ?? ""),
          status: uiStatus,
          description: b.description || "",
        });
      } catch (e: any) {
        if (alive) setServerError(e?.message || "Failed to load book");
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (bookId) load();

    return () => {
      alive = false;
    };
  }, [bookId]);

  const errors = useMemo(() => validate(form), [form]);
  const canSubmit = Object.keys(errors).length === 0 && !saving && !deleting;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSubmitted(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");

    const errs = validate(form);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const token = getToken();

      const price = Number(form.price);
      const stock = Number(form.stock);

      const mapped = uiToBackendStatus(form.status);
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category.trim(),
        isbn: form.isbn.trim() ? form.isbn.replace(/[-\s]/g, "") : undefined,
        price,
        stock: typeof mapped.stockOverride === "number" ? mapped.stockOverride : stock,
        status: mapped.status,
        description: form.description.trim(),
      };

      const res = await fetch(`${API_URL}/api/admin/books/${bookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Failed to save (${res.status})`);

      router.push("/admin/books");
    } catch (e: any) {
      setServerError(e?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    const ok = window.confirm("Delete this book? This action can't be undone.");
    if (!ok) return;

    setDeleting(true);
    setServerError("");

    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/api/admin/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || `Failed to delete (${res.status})`);

      router.push("/admin/books");
    } catch (e: any) {
      setServerError(e?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl bg-white rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-gray-600">Loading book…</p>
      </div>
    );
  }

  if (!bookExists) {
    return (
      <div className="max-w-3xl bg-white rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Book not found</h1>
        <p className="text-sm text-gray-500 mt-1">
          The book ID <span className="font-semibold text-gray-800">{bookId}</span> doesn’t exist.
        </p>
        <Link
          href="/admin/books"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Edit Book</h1>
          <p className="text-sm text-gray-500">
            Editing <span className="font-semibold text-gray-800">{bookId.slice(-6).toUpperCase()}</span>
          </p>
        </div>

        <Link
          href="/admin/books"
          className="px-4 py-2 rounded-xl bg-white shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          ← Back to Books
        </Link>
      </div>

      {/* Error */}
      {serverError && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-red-600 font-semibold">{serverError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSave} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Title"
            required
            value={form.title}
            onChange={(v) => setField("title", v)}
            error={submitted ? errors.title : undefined}
            placeholder="Atomic Habits"
          />

          <Field
            label="Author"
            required
            value={form.author}
            onChange={(v) => setField("author", v)}
            error={submitted ? errors.author : undefined}
            placeholder="James Clear"
          />

          <Field
            label="Category"
            required
            value={form.category}
            onChange={(v) => setField("category", v)}
            error={submitted ? errors.category : undefined}
            placeholder="Self-help"
          />

          <Field
            label="ISBN"
            value={form.isbn}
            onChange={(v) => setField("isbn", v)}
            error={submitted ? errors.isbn : undefined}
            placeholder="978-0735211292"
          />

          <Field
            label="Price (USD)"
            required
            inputMode="decimal"
            value={form.price}
            onChange={(v) => setField("price", v)}
            error={submitted ? errors.price : undefined}
            placeholder="12.99"
          />

          <Field
            label="Stock"
            required
            inputMode="numeric"
            value={form.stock}
            onChange={(v) => setField("stock", v)}
            error={submitted ? errors.stock : undefined}
            placeholder="20"
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-800">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <RadioPill
                label="Active"
                checked={form.status === "Active"}
                onClick={() => setField("status", "Active")}
              />
              <RadioPill
                label="Draft"
                checked={form.status === "Draft"}
                onClick={() => setField("status", "Draft")}
              />
              <RadioPill
                label="Out of Stock"
                checked={form.status === "Out of Stock"}
                onClick={() => setField("status", "Out of Stock")}
              />
            </div>
            {submitted && errors.status && <p className="mt-2 text-xs text-red-600">{errors.status}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            className="mt-2 w-full min-h-[120px] rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none
                       focus:border-[#1a4fc7]"
            placeholder="Short description about the book..."
          />
          {submitted && errors.description && <p className="mt-2 text-xs text-red-600">{errors.description}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-xs text-gray-500">
            * Connected to backend (GET/PATCH/DELETE).
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting || saving}
              className={
                "px-5 py-2.5 rounded-xl bg-white border text-sm font-semibold transition " +
                (deleting || saving
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-red-200 text-red-700 hover:bg-red-50")
              }
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className={
                "px-5 py-2.5 rounded-xl text-sm font-semibold transition " +
                (canSubmit
                  ? "bg-[#ff9f24] text-[#0b1e4a] hover:brightness-95 shadow-sm"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed")
              }
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ================= Helpers ================= */

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  error,
  inputMode,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode={inputMode}
        placeholder={placeholder}
        className={
          "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition " +
          (error ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-[#1a4fc7]")
        }
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function RadioPill({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-4 py-2 rounded-xl text-sm font-semibold border transition " +
        (checked
          ? "bg-[#1a4fc7] text-white border-[#1a4fc7]"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50")
      }
    >
      {label}
    </button>
  );
}

function validate(form: FormState): Errors {
  const errs: Errors = {};

  if (!form.title.trim()) errs.title = "Title is required.";
  if (!form.author.trim()) errs.author = "Author is required.";
  if (!form.category.trim()) errs.category = "Category is required.";

  if (form.isbn.trim()) {
    const cleaned = form.isbn.replace(/[-\s]/g, "");
    if (!/^\d{10}(\d{3})?$/.test(cleaned)) {
      errs.isbn = "ISBN should be 10 or 13 digits (hyphens allowed).";
    }
  }

  const price = Number(form.price);
  if (!form.price.trim()) errs.price = "Price is required.";
  else if (!Number.isFinite(price) || price <= 0) errs.price = "Price must be a number greater than 0.";

  const stock = Number(form.stock);
  if (!form.stock.trim()) errs.stock = "Stock is required.";
  else if (!Number.isFinite(stock) || stock < 0) errs.stock = "Stock must be 0 or more.";

  if (!form.status) errs.status = "Status is required.";

  if (form.description.length > 600) errs.description = "Description should be under 600 characters.";

  return errs;
}