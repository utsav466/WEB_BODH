"use client";

import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Branding Section */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-blue-600 p-12">
        <img
          src="/logo_varient_2.png"
          alt="BODH Logo"
          width={300}
          height={300}
          className="mb-6"
        />
        <p className="text-lg md:text-xl opacity-90 text-center max-w-sm text-white">
          Your digital bookshelf, just a login away.
        </p>
      </div>

      {/* Right Form Section */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-12 shadow-lg">
        <RegisterForm />
      </div>
    </div>
  );
}
