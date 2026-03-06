// import Header from "./public/components/Header";

import Header from "./public/components/Header";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{
        backgroundImage: "url('/BG.png')", // background image covers entire page
      }}
    >
      {/* Top Navigation */}
      <Header />

      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center flex-1 text-center px-6 
                   mx-4 md:mx-20 p-8"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
          Your Online Book Haven
        </h1>
        <p className="text-lg md:text-xl text-white max-w-2xl mb-8 drop-shadow-md">
          Discover, explore, and buy books effortlessly from a curated digital
          library built for readers of every kind.
        </p>

        {/* Button navigates to /auth/login */}
        <Link href="/auth/login">
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg shadow-md transition">
            Get Started
          </button>
        </Link>
      </section>
    </main>
  );
}
