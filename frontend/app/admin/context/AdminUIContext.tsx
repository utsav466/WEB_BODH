"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

type AdminUIContextValue = {
  search: string;
  setSearch: (v: string) => void;
  clearSearch: () => void;
};

const AdminUIContext = createContext<AdminUIContextValue | null>(null);

export function AdminUIProvider({ children }: { children: React.ReactNode }) {
  const [search, setSearch] = useState("");

  const value = useMemo<AdminUIContextValue>(
    () => ({
      search,
      setSearch,
      clearSearch: () => setSearch(""),
    }),
    [search]
  );

  return <AdminUIContext.Provider value={value}>{children}</AdminUIContext.Provider>;
}

export function useAdminUI() {
  const ctx = useContext(AdminUIContext);
  if (!ctx) {
    throw new Error("useAdminUI must be used inside AdminUIProvider");
  }
  return ctx;
}