"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { apiFetch } from "../../../../lib/api";
// import { apiFetch } from "@/lib/api";

type FormState = {
  title: string;
  author: string;
  category: string;
  isbn: string;
  price: string;   // keep as string for inputs
  stock: string;   // keep as string for inputs
  status: "active" | "inactive";
  description: string;
};

function validate(f: FormState) {
  const e: Record<string, string> = {};

  if (!f.title.trim()) e.title = "Title required";
  if (!f.author.trim()) e.author = "Author required";
  if (!f.category.trim()) e.category = "Category required";

  const price = Number(f.price);
  if (!f.price.trim() || Number.isNaN(price) || price < 0) e.price = "Valid price required";

  const stock = Number(f.stock);
  if (!f.stock.trim() || Number.isNaN(stock) || stock < 0) e.stock = "Valid stock required";

  // optional but if present must be 10/13 digits
  if (f.isbn.trim()) {
    const digits = f.isbn.replace(/[-\s]/g, "");
    if (!(digits.length === 10 || digits.length === 13) || !/^\d+$/.test(digits)) {
      e.isbn = "ISBN must be 10 or 13 digits";
    }
  }

  return e;
}

export default function CreateBookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    author: "",
    category: "",
    isbn: "",
    price: "",
    stock: "",
    status: "active",
    description: "",
  });

  const errors = useMemo(() => validate(form), [form]);
  const canSubmit = Object.keys(errors).length === 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const errs = validate(form);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        category: form.category.trim(),
        isbn: form.isbn.trim() ? form.isbn.replace(/[-\s]/g, "") : undefined,
        price: Number(form.price),
        stock: Number(form.stock),
        status: form.status,
        description: form.description.trim(),
      };

      await apiFetch<{ success: boolean; message?: string; data?: any }>(
        "/api/admin/books",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      router.push("/admin/books"); // go back to list after create
    } catch (err: any) {
      setServerError(err?.message || "Failed to create book");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900">Create Book</h1>
      <p className="text-sm text-gray-600 mt-1">Add a new book to your store.</p>

      <form onSubmit={onSubmit} className="mt-6 bg-white rounded-2xl p-6 shadow-sm space-y-4">
        {serverError && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl">
            {serverError}
          </div>
        )}

        <Field
          label="Title"
          value={form.title}
          onChange={(v) => setForm((s) => ({ ...s, title: v }))}
          error={errors.title}
        />
        <Field
          label="Author"
          value={form.author}
          onChange={(v) => setForm((s) => ({ ...s, author: v }))}
          error={errors.author}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Category"
            value={form.category}
            onChange={(v) => setForm((s) => ({ ...s, category: v }))}
            error={errors.category}
          />
          <Field
            label="ISBN (optional)"
            value={form.isbn}
            onChange={(v) => setForm((s) => ({ ...s, isbn: v }))}
            error={errors.isbn}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Price"
            value={form.price}
            onChange={(v) => setForm((s) => ({ ...s, price: v }))}
            error={errors.price}
            inputMode="decimal"
          />
          <Field
            label="Stock"
            value={form.stock}
            onChange={(v) => setForm((s) => ({ ...s, stock: v }))}
            error={errors.stock}
            inputMode="numeric"
          />
          <div>
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              className="mt-1 w-full h-11 rounded-xl border border-gray-200 px-3 outline-none"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as any }))}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 w-full min-h-28 rounded-xl border border-gray-200 p-3 outline-none"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className={
              "h-11 px-5 rounded-xl font-semibold text-sm transition " +
              (canSubmit
                ? "bg-[#1537e2] text-white hover:brightness-95"
                : "bg-gray-200 text-gray-500 cursor-not-allowed")
            }
          >
            {loading ? "Creating..." : "Create Book"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/books")}
            className="h-11 px-5 rounded-xl font-semibold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{props.label}</label>
      <input
        className={
          "mt-1 w-full h-11 rounded-xl border px-3 outline-none " +
          (props.error ? "border-red-300" : "border-gray-200")
        }
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        inputMode={props.inputMode}
      />
      {props.error && <p className="text-xs text-red-600 mt-1">{props.error}</p>}
    </div>
  );
}