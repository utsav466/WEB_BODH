import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "programming";
    const limit = searchParams.get("limit") || "18";

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(limit)}`;

    const res = await fetch(url, {
      // some networks are strict; headers help sometimes
      headers: { "User-Agent": "Mozilla/5.0" },
      // avoid caching issues during dev
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "OpenLibrary request failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, message: e?.message || "Proxy failed" },
      { status: 500 }
    );
  }
}