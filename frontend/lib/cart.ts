// lib/cart.ts
export type CartItem = {
  bookId: string;
  title: string;
  price: number;
  qty: number;
  coverUrl?: string;
};

const CART_KEY = "bodh_cart_v1";
const CART_EVENT = "bodh_cart_updated";

function safeParse(json: string | null): CartItem[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : []; 
  } catch {
    return [];
  }
}

function emitCartUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(CART_KEY));
}

export function setCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  emitCartUpdate();
}

// ✅ NEW: total quantity count (sum of qty)
export function getCartCount(): number {
  const items = getCart();
  return items.reduce((sum, it) => sum + (it.qty || 0), 0);
}

export function addToCart(item: Omit<CartItem, "qty">, qty: number = 1) {
  const items = getCart();

  const existing = items.find((x) => x.bookId === item.bookId);
  if (existing) {
    existing.qty = Math.max(1, existing.qty + qty);
  } else {
    items.push({ ...item, qty: Math.max(1, qty) });
  }

  setCart(items);
  return items;
}

export function removeFromCart(bookId: string) {
  const items = getCart().filter((x) => x.bookId !== bookId);
  setCart(items);
  return items;
}

export function updateQty(bookId: string, qty: number) {
  const items = getCart().map((x) =>
    x.bookId === bookId ? { ...x, qty: Math.max(1, qty) } : x
  );
  setCart(items);
  return items;
}

export function clearCart() {
  if (typeof window === "undefined") return [];
  localStorage.removeItem(CART_KEY);
  emitCartUpdate();
  return [];
}

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, it) => sum + (it.price || 0) * (it.qty || 0),
    0
  );
  return { subtotal };
}

// ✅ Optional: export event name if you want it elsewhere
export const CART_UPDATED_EVENT = CART_EVENT;