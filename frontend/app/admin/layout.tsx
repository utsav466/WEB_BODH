import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";
import { AdminUIProvider } from "./context/AdminUIContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminUIProvider>
      <div className="min-h-screen bg-[#f2f5fb]">
        <div className="flex min-h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <Topbar />
            {children}
          </main>
        </div>
      </div>
    </AdminUIProvider>
  );
}