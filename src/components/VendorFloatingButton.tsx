"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type VendorFloatingButtonProps = {
  isVendorLoggedIn: boolean;
};

export default function VendorFloatingButton({ isVendorLoggedIn }: VendorFloatingButtonProps) {
  const pathname = usePathname();

  const hideOnRoute =
    pathname.startsWith("/admin") ||
    pathname === "/vendor/auth" ||
    pathname.startsWith("/vendor/auth/") ||
    pathname === "/vendor/dashboard" ||
    pathname.startsWith("/vendor/dashboard/");

  if (hideOnRoute || isVendorLoggedIn) {
    return null;
  }

  return (
    <Link
      href="/vendor/auth"
      className="fixed bottom-24 right-4 z-[60] rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 md:bottom-8 md:right-8"
    >
      Become a Vendor
    </Link>
  );
}
