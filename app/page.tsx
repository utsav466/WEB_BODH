import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center ">
      <Image
        src="/bodhBlue.svg"
        alt="BODH Logo"
        width={200}
        height={200}
        className="mb-6"
        priority
      />
      <h1 className="text-4xl font-bold text-blue-600">Welcome to BODH</h1>
      <p className="text-gray-700 mt-2">Your digital bookshelf, just a login away.</p>
      <div className="flex gap-4 mt-6">
        <Link
          href="/auth/login"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium shadow hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          href="/auth/register"
          className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 font-medium hover:bg-blue-50"
        >
          Sign Up
        </Link>
        {/* <Link
         
          className="rounded-lg border border-green-600 px-4 py-2 text-green-600 font-medium hover:bg-green-50"
        
        </Link> */}
      </div>
    </main>
  );
}
