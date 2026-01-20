import Header from "../component/Header";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Blue nav bar */}
      <Header />

      {/* White content area */}
      <main className="flex-1 bg-white p-8">
        <h1 className="text-4xl font-bold text-blue-700">Welcome to Dashboard</h1>
        <p className="mt-2 text-gray-600">You are now logged in.</p>
      </main>
    </div>
  );
}
