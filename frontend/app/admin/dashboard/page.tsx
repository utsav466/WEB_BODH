"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth/login");
  };

  return (
    <div className="w-screen h-screen bg-[#f2f5fb]">
      <div className="w-full h-full flex overflow-hidden">

        {/* ================= Sidebar ================= */}
        <aside className="w-64 bg-[#0b1e4a] text-white flex flex-col">
          <div className="px-6 py-6 border-b border-white/10">
            <div className="w-8 h-8 bg-white rounded-full mb-3" />
            <h1 className="text-sm font-semibold tracking-wide">
              BODH Admin
            </h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
            <Link
              href="/admin/dashboard"
              className="flex items-center px-4 py-2 rounded-md
                         bg-white/10 text-white"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center px-4 py-2 rounded-md
                         text-white/70 hover:bg-white/10 hover:text-white"
            >
              Users
            </Link>
          </nav>

          <div className="px-4 py-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-md text-sm font-medium
                         bg-red-600 text-white hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* ================= Main ================= */}
        <main className="flex-1 p-8 overflow-y-auto">

          {/* Header */}
          <header className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Admin Dashboard
            </h2>
            <p className="text-sm text-gray-600">
              E-commerce book store administration
            </p>
          </header>

          {/* ================= Top Stats ================= */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <ColorStat title="Total Users" color="blue" />
            <ColorStat title="Admins" color="yellow" />
            <ColorStat title="New Registrations" color="green" />
            <RevenueCard />
          </section>

          {/* ================= Main Grid ================= */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

            {/* Book Covers */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Book Inventory Preview
              </h3>

              <div className="grid grid-cols-4 gap-4">
                <BookCover />
                <BookCover />
                <BookCover />
                <BookCover />
              </div>
            </div>

            {/* Bestseller */}
            <BestsellerWidget />
          </section>

          {/* ================= Orders + Actions ================= */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Orders */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Recent Orders
              </h3>

              <table className="w-full text-sm">
                <thead className="bg-[#1a4fc7] text-white">
                  <tr>
                    <th className="py-2 px-3 text-left rounded-l-md">Order</th>
                    <th className="px-3 text-left">Customer</th>
                    <th className="px-3 text-left rounded-r-md">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <OrderRow status="Paid" />
                  <OrderRow status="Shipped" />
                  <OrderRow status="Pending" />
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <ActionCard
                title="User Management"
                description="View, edit, or remove users."
                href="/admin/users"
                action="Go to Users"
              />

              <ActionCard
                title="Create User"
                description="Create a new user or admin."
                href="/admin/users/create"
                action="Create User"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ================= UI Components ================= */

function ColorStat({ title, color }: { title: string; color: "blue" | "yellow" | "green" }) {
  const map = {
    blue: "bg-blue-500",
    yellow: "bg-yellow-400",
    green: "bg-green-500",
  };

  return (
    <div className={`${map[color]} text-white rounded-xl p-4 shadow`}>
      <p className="text-xs opacity-80">{title}</p>
      <p className="text-lg font-semibold mt-1">—</p>
    </div>
  );
}

function RevenueCard() {
  return (
    <div className="bg-gradient-to-r from-[#1a4fc7] to-blue-600
                    text-white rounded-xl p-4 shadow">
      <p className="text-xs opacity-80">Monthly Revenue</p>
      <p className="text-xl font-semibold mt-1">$12,840</p>
      <p className="text-xs opacity-70 mt-1">+12% this month</p>
    </div>
  );
}

function BookCover() {
  return (
    <div className="h-36 bg-gray-200 rounded-lg flex items-center justify-center
                    text-xs text-gray-500">
      Book Cover
    </div>
  );
}

function BestsellerWidget() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Bestsellers
      </h3>

      <ul className="space-y-3 text-sm">
        <li className="flex justify-between">
          <span>Atomic Habits</span>
          <span className="text-gray-500">1,240</span>
        </li>
        <li className="flex justify-between">
          <span>Rich Dad Poor Dad</span>
          <span className="text-gray-500">980</span>
        </li>
        <li className="flex justify-between">
          <span>Think Like a Monk</span>
          <span className="text-gray-500">860</span>
        </li>
      </ul>
    </div>
  );
}

function OrderRow({ status }: { status: "Paid" | "Shipped" | "Pending" }) {
  const map = {
    Paid: "bg-green-100 text-green-700",
    Shipped: "bg-blue-100 text-blue-700",
    Pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <tr className="border-b last:border-none text-gray-600">
      <td className="py-2 px-3">#ORD-1023</td>
      <td className="px-3">John Doe</td>
      <td className="px-3">
        <span className={`text-xs px-2 py-1 rounded-full ${map[status]}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function ActionCard({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition">
      <h4 className="text-sm font-semibold text-gray-800">
        {title}
      </h4>
      <p className="text-xs text-gray-600 mt-1">
        {description}
      </p>
      <Link
        href={href}
        className="inline-block mt-3 text-sm font-medium text-[#1a4fc7]"
      >
        {action} →
      </Link>
    </div>
  );
}
