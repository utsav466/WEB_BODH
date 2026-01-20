"use server";

import { cookies } from "next/headers";

export interface UserData {
  _id: string;
  username: string;
  email?: string;
  role: string;
}

const isProd = process.env.NODE_ENV === "production";

/* ================= AUTH TOKEN ================= */

export const setAuthToken = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "auth_token",
    value: token,
    path: "/",
    httpOnly: false, // set true later for better security
    secure: isProd,
    sameSite: "lax",
  });
};

export const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value ?? null;
};

/* ================= USER DATA (SAFE) ================= */

export const setUserData = async (userData: any) => {
  const cookieStore = await cookies();

  // ✅ ONLY SAFE FIELDS
  const safeUser: UserData = {
    _id: userData._id,
    username: userData.username,
    email: userData.email,
    role: userData.role,
  };

  cookieStore.set({
    name: "user_data",
    value: JSON.stringify(safeUser),
    path: "/",
    httpOnly: false,
    secure: isProd,
    sameSite: "lax",
  });
};

export const getUserData = async (): Promise<UserData | null> => {
  const cookieStore = await cookies();
  const value = cookieStore.get("user_data")?.value;

  if (!value) return null;

  try {
    return JSON.parse(value) as UserData;
  } catch {
    return null;
  }
};

/* ================= CLEAR ================= */

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();

  cookieStore.delete({ name: "auth_token", path: "/" });
  cookieStore.delete({ name: "user_data", path: "/" });
};
