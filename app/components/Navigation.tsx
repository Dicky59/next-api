"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  // Hide navigation on dashboard page (it has its own sidebar)
  if (pathname?.startsWith("/dashboards")) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-lg font-semibold text-gray-900"
        >
          API Manager
        </Link>
        <Link
          href="/dashboards"
          className="flex h-10 items-center justify-center rounded-lg bg-green-600 px-5 text-white transition-colors hover:bg-green-700"
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}

