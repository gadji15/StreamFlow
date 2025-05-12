'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./SidebarItem";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { cn } from "@/lib/utils";

// Hook to get userId (replace this with your actual user logic)
function useCurrentUserId(): string | null {
  // TODO: Plug in your auth system
  return "demo-user";
}

type SidebarItemData = {
  id: string;
  label: string;
  icon: string;
  route: string;
  permissions?: string[];
  children?: SidebarItemData[];
};

export default function AdminSidebar() {
  const userId = useCurrentUserId();
  const pathname = usePathname();
  const [sidebarItems, setSidebarItems] = useState<SidebarItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer state (mobile < 640px)
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/sidebar?userId=${userId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement de la sidebar.");
        const data = await res.json();
        setSidebarItems(data);
      })
      .catch((err) => setError(err.message || "Erreur inconnue."))
      .finally(() => setLoading(false));
  }, [userId]);

  // Responsive: close drawer on navigation
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Responsive classes
  // w-16: compact (sm), w-64: expanded (lg+)
  const sidebarBaseClass =
    "bg-gray-900 border-r border-gray-800 flex-shrink-0 h-screen sticky top-0 overflow-y-auto transition-all duration-200 z-40";

  // Hamburger button (mobile)
  const Hamburger = (
    <button
      className="md:hidden absolute top-4 left-4 z-50 p-2 rounded bg-gray-900 border border-gray-700"
      onClick={() => setDrawerOpen((open) => !open)}
      aria-label="Ouvrir le menu"
    >
      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  // Overlay (mobile)
  const Overlay = (
    <div
      className={cn(
        "fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity",
        drawerOpen ? "block" : "hidden"
      )}
      onClick={() => setDrawerOpen(false)}
    />
  );

  // Sidebar content
  const SidebarContent = (
    <div
      className={cn(
        sidebarBaseClass,
        "w-64 hidden md:block", // expanded sidebar for md+
        "md:w-16 lg:w-64",      // compact for md, expanded for lg+
        "md:flex flex-col"
      )}
    >
      <div className="p-6">
        <Link href="/admin" className="flex items-center">
          <h1 className="text-xl font-bold font-sans" style={{ color: "var(--primary, #4299e1)" }}>
            StreamFlow Admin
          </h1>
        </Link>
      </div>
      <nav className="px-3 py-2 flex-1 flex flex-col">
        {loading && <LoadingSpinner className="mt-4" />}
        {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}
        <ul>
          {sidebarItems?.map((item) => (
            <SidebarItem {...item} key={item.id} />
          ))}
        </ul>
      </nav>
      <div className="mt-auto px-3 pb-4">
        <Link
          href="/"
          className="flex items-center text-sm text-gray-400 hover:text-white"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="2" d="M18 13v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6m16-2V7a2 2 0 0 0-2-2h-4l-2-2-2 2H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2z" />
          </svg>
          <span className="hidden lg:inline">Voir le site</span>
        </Link>
      </div>
    </div>
  );

  // Drawer sidebar (mobile)
  const DrawerSidebar = (
    <>
      {Overlay}
      <aside
        className={cn(
          sidebarBaseClass,
          "fixed left-0 top-0 w-64 h-screen md:hidden transition-transform",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar mobile"
      >
        <div className="p-6">
          <Link href="/admin" className="flex items-center">
            <h1 className="text-xl font-bold font-sans" style={{ color: "var(--primary, #4299e1)" }}>
              StreamFlow Admin
            </h1>
          </Link>
        </div>
        <nav className="px-3 py-2 flex-1 flex flex-col">
          {loading && <LoadingSpinner className="mt-4" />}
          {error && <ErrorBanner message={error} onRetry={() => window.location.reload()} />}
          <ul>
            {sidebarItems?.map((item) => (
              <SidebarItem {...item} key={item.id} />
            ))}
          </ul>
        </nav>
        <div className="mt-auto px-3 pb-4">
          <Link
            href="/"
            className="flex items-center text-sm text-gray-400 hover:text-white"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeWidth="2" d="M18 13v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6m16-2V7a2 2 0 0 0-2-2h-4l-2-2-2 2H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2z" />
            </svg>
            <span className="hidden lg:inline">Voir le site</span>
          </Link>
        </div>
      </aside>
    </>
  );

  return (
    <>
      {Hamburger}
      {/* Drawer for mobile */}
      {DrawerSidebar}
      {/* Sidebar for md+ (hidden on mobile) */}
      <div className="hidden md:block">
        {SidebarContent}
      </div>
    </>
  );
}