"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/LOGO.png"
            alt="BODH Logo"
            width={100}
            height={100}
            className="rounded"
          />
          {/* <span className="text-2xl font-bold text-gray-900">BODH</span> */}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium">
          <Link href="/genres">Genres</Link>
          <Link href="/new-releases">New Releases</Link>
          <Link href="/best-sellers">Best Sellers</Link>
          <Link href="/authors">Authors</Link>
          <Link href="/book-reviews">Book Reviews</Link>
          <Link href="/public/about">About Us</Link>
          <Link href="/auth/login">Account</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="md:hidden bg-gray-50 px-6 py-4 space-y-3 text-gray-700 font-medium">
          <Link href="/genres">Genres</Link>
          <Link href="/new-releases">New Releases</Link>
          <Link href="/best-sellers">Best Sellers</Link>
          <Link href="/authors">Authors</Link>
          <Link href="/book-reviews">Book Reviews</Link>
          <Link href="/public/about">About Us</Link>
          <Link href="/auth/login">Account</Link>
        </nav>
      )}
    </header>
  );
}
