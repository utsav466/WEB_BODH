// import { NextRequest, NextResponse } from "next/server";
// import { getUserData, getAuthToken } from "./lib/cookie";

// const publicPaths = ["/login", "/register", "/forgot-password"];
// const adminPaths = ["/admin"];
// const userPaths = ["/user"];

// export async function proxy(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   const token = await getAuthToken();
//   const user = token ? await getUserData() : null;

//   const isPublicPath = publicPaths.some((path) =>
//     pathname.startsWith(path)
//   );

//   const isAdminPath = adminPaths.some((path) =>
//     pathname.startsWith(path)
//   );

//   const isUserPath = userPaths.some((path) =>
//     pathname.startsWith(path)
//   );

//   // 🔒 Not logged in → block all except public
//   if (!token && !isPublicPath) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // 🔐 Logged in but accessing admin without role
//   if (token && user) {
//     if (isAdminPath && user.role !== "admin") {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//   }

//   // 🔁 Logged in user should not access login/register
//   if (isPublicPath && user) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/user/:path*",
//     "/login",
//     "/register",
//   ],
// };


import { NextRequest, NextResponse } from "next/server";
import { getUserData, getAuthToken } from "./lib/cookie";

// Public routes (no login required)
const publicPaths = ["/auth/login", "/auth/register"];

// Protected route groups
const adminPaths = ["/admin"];
const userPaths = ["/user"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getAuthToken();
  const user = token ? await getUserData() : null;

  const isPublicPath = publicPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isAdminPath = adminPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isUserPath = userPaths.some((path) =>
    pathname.startsWith(path)
  );

  // 🔒 Not logged in → block everything except public pages
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 🔐 Logged in but not admin → block admin routes
  if (token && user && isAdminPath && user.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 🔁 Logged-in users should not see login/register
  if (token && user && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
