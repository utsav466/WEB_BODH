// frontend/lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

type ApiFetchOptions = RequestInit & {
  auth?: boolean; // add token automatically
};

export async function apiFetch<T = any>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (options.auth) {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.message || "Request failed";
    throw new Error(msg);
  }

  return data as T;
}