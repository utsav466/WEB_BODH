import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {/* Main Card Container */}
      <main className="flex w-full max-w-5xl h-[70vh] rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Left Branding Section */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 text-white p-12">
          <img
            src="/LOGO.png"
            alt="BODH Logo"
            width={300}
            height={300}
            className="mb-6 filter brightness-0 invert"
          />
          <h1 className="text-3xl font-bold mb-4">Hello, welcome!</h1>
          <p className="text-lg max-w-sm text-center opacity-90 mb-6">
            Discover your next favorite book, build your digital shelf, and keep every story just a login away.
          </p>
        </div>

        {/* Right Form Section */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-12">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}



