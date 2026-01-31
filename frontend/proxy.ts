import { NextRequest, NextResponse } from "next/server";
import { getUserData, getAuthToken } from "./lib/cookie";

const publicPaths = ["/login", "/register", "/forgot-password"];
const adminPaths = ["/admin"]
const userPaths=["/user"];


export async function proxy(req: NextRequest){
    const { pathname } = req.nextUrl;
    
    const token = await getAuthToken();
    const user = token ? await getUserData() : null;

    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
    
    const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));

    if(!token && !isPublicPath){
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if(token && user){
        if(isAdminPath && user.role !== "admin"){
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    if(isPublicPath && user){
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // which path should be checked inside proxy
        "/admin/:path*",
        "/login",
        "/register"
    ],
}