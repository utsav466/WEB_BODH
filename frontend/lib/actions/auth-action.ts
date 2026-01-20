"use server";

import { login, register } from "../api/auth";
import { setAuthToken, setUserData } from "../cookie";
// import { setAuthToken, setUserData } from "@/lib/cookie";

/* ================= REGISTER ================= */

export const handleRegister = async (formData: any) => {
  try {
    const res = await register(formData);

    if (res.success) {
      // 🔒 COOKIE (optional on register – only if token exists)
      if (res.token) {
        await setAuthToken(res.token);
      }

      if (res.data) {
        await setUserData(res.data);
      }

      return {
        success: true,
        data: res.data,
        token: res.token, // unchanged
        message: "Registration successful",
      };
    }

    return {
      success: false,
      message: res.message || "Registration failed",
    };
  } catch (err: Error | any) {
    return {
      success: false,
      message: err.message || "Registration failed",
    };
  }
};

/* ================= LOGIN ================= */

export const handleLogin = async (formData: any) => {
  try {
    const res = await login(formData);

    if (res.success) {
      // 🔒 COOKIE — THIS IS THE IMPORTANT PART
      if (res.token) {
        await setAuthToken(res.token);
      }

      if (res.data) {
        await setUserData(res.data);
      }

      return {
        success: true,
        data: res.data,
        token: res.token, // still returned (client no longer stores it)
        message: "Login successful",
      };
    }

    return {
      success: false,
      message: res.message || "Login failed",
    };
  } catch (err: Error | any) {
    return {
      success: false,
      message: err.message || "Login failed",
    };
  }
};
