// lib/wishlist.ts
export type WishlistItem = {
  bookId: string;
  title: string;
  author?: string;
  price: number;
  coverUrl?: string;
  category?: string;
  savedAt: string;
};

const KEY = "bodh_wishlist_v1";
const EVENT = "bodh_wishlist_updated";

function safeParse(json: string | null): WishlistItem[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

export function getWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(KEY));
}

export function setWishlist(items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

export function isWishlisted(bookId: string): boolean {
  return getWishlist().some((x) => x.bookId === bookId);
}

export function toggleWishlist(item: Omit<WishlistItem, "savedAt">) {
  const items = getWishlist();
  const exists = items.find((x) => x.bookId === item.bookId);

  let next: WishlistItem[];
  if (exists) {
    next = items.filter((x) => x.bookId !== item.bookId);
  } else {
    next = [{ ...item, savedAt: new Date().toISOString() }, ...items];
  }

  setWishlist(next);
  return next;
}

export function removeFromWishlist(bookId: string) {
  const next = getWishlist().filter((x) => x.bookId !== bookId);
  setWishlist(next);
  return next;
}

export function clearWishlist() {
  if (typeof window === "undefined") return [];
  localStorage.removeItem(KEY);
  emit();
  return [];
}

export function getWishlistCount(): number {
  return getWishlist().length;
}

export const WISHLIST_UPDATED_EVENT = EVENT;
export const WISHLIST_KEY = KEY;