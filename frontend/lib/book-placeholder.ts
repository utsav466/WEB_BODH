// frontend/lib/book-placeholder.ts

function hashString(str: string) {
  let hash = 0;
  const s = str || "book";
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(arr: T[], seed: number) {
  return arr[seed % arr.length];
}

function splitTitle(title: string) {
  const words = (title || "Untitled Book").trim().split(/\s+/);
  if (words.length <= 2) return [words.join(" "), ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function escapeXml(str: string) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function getBookPlaceholder(
  title: string,
  author?: string,
  category?: string
) {
  const seed = hashString(`${title}-${author || ""}-${category || ""}`);

  const palettes = [
    ["#1e3a8a", "#3b82f6", "#dbeafe"],
    ["#7c2d12", "#ea580c", "#ffedd5"],
    ["#14532d", "#22c55e", "#dcfce7"],
    ["#581c87", "#a855f7", "#f3e8ff"],
    ["#9f1239", "#f43f5e", "#ffe4e6"],
    ["#0f172a", "#334155", "#e2e8f0"],
    ["#164e63", "#06b6d4", "#cffafe"],
    ["#78350f", "#f59e0b", "#fef3c7"],
  ];

  const [bg1, bg2, accent] = pick(palettes, seed);

  const label = pick(
    [
      "BODH EDITION",
      "MODERN READS",
      "CURATED BOOK",
      "BOOKSTORE PICK",
      "READER'S CHOICE",
      "FEATURED TITLE",
    ],
    seed >> 2
  );

  const icon = pick(["✦", "◉", "◆", "✷", "✹", "⬢"], seed >> 3);

  const [line1, line2] = splitTitle(title || "Untitled Book");
  const safeTitle1 = escapeXml(line1);
  const safeTitle2 = escapeXml(line2);
  const safeAuthor = escapeXml(author || "Unknown Author");
  const safeCategory = escapeXml(category || "General");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
      <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(255,255,255,0.28)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </linearGradient>
    </defs>

    <rect width="600" height="900" rx="28" fill="url(#bg)" />
    <rect x="0" y="0" width="28" height="900" fill="rgba(0,0,0,0.18)" />
    <rect x="40" y="40" width="520" height="820" rx="24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)" />
    <rect x="52" y="52" width="140" height="12" rx="6" fill="${accent}" opacity="0.95" />

    <text x="60" y="110" font-size="26" font-family="Georgia, serif" fill="white" opacity="0.95">${escapeXml(
      label
    )}</text>

    <circle cx="470" cy="150" r="64" fill="${accent}" opacity="0.18" />
    <circle cx="510" cy="195" r="24" fill="${accent}" opacity="0.28" />
    <circle cx="445" cy="215" r="12" fill="${accent}" opacity="0.32" />

    <text x="60" y="300" font-size="66" font-weight="700" font-family="Georgia, serif" fill="white">${safeTitle1}</text>
    ${
      safeTitle2
        ? `<text x="60" y="380" font-size="66" font-weight="700" font-family="Georgia, serif" fill="white">${safeTitle2}</text>`
        : ""
    }

    <line x1="60" y1="450" x2="230" y2="450" stroke="${accent}" stroke-width="8" stroke-linecap="round" />

    <text x="60" y="520" font-size="28" font-family="Arial, sans-serif" fill="white" opacity="0.9">by ${safeAuthor}</text>

    <rect x="60" y="590" width="170" height="42" rx="21" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.18)" />
    <text x="145" y="618" text-anchor="middle" font-size="20" font-family="Arial, sans-serif" fill="white">${safeCategory}</text>

    <rect x="60" y="700" width="480" height="120" rx="22" fill="rgba(255,255,255,0.08)" />
    <text x="80" y="760" font-size="64" font-family="Georgia, serif" fill="${accent}" opacity="0.95">${escapeXml(
      icon
    )}</text>
    <text x="140" y="752" font-size="24" font-family="Arial, sans-serif" fill="white" opacity="0.88">Curated reading experience</text>
    <text x="140" y="790" font-size="18" font-family="Arial, sans-serif" fill="white" opacity="0.7">Placeholder cover for unavailable artwork</text>

    <rect x="0" y="0" width="600" height="900" rx="28" fill="url(#shine)" opacity="0.18" />
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getBookImage(
  coverUrl?: string,
  apiBase?: string,
  title?: string,
  author?: string,
  category?: string
) {
  if (coverUrl) {
    if (
      coverUrl.startsWith("http://") ||
      coverUrl.startsWith("https://") ||
      coverUrl.startsWith("data:image/")
    ) {
      return coverUrl;
    }
    return `${apiBase || ""}${coverUrl}`;
  }

  return getBookPlaceholder(title || "Untitled Book", author, category);
}