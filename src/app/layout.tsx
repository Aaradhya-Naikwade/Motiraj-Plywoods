import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorFloatingButton from "@/components/VendorFloatingButton";
import AppToaster from "@/components/AppToaster";
import { VENDOR_AUTH_COOKIE } from "@/lib/auth-cookies";
import { verifyVendorSessionToken } from "@/lib/vendor-auth";
import { findVendorById } from "@/lib/vendor-repo";
import { isVendorRenewalExpired } from "@/lib/vendor-renewal";

export const metadata: Metadata = {
  title: "Ratlami Interio",
  description: "Interior & Vendors Platform",
  icons: {
    icon: "/image/logo.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(VENDOR_AUTH_COOKIE)?.value;
  let isVendorLoggedIn = false;

  if (sessionCookie) {
    const session = verifyVendorSessionToken(sessionCookie);
    if (session) {
      const vendor = await findVendorById(session.sub);
      isVendorLoggedIn = Boolean(
        vendor &&
        ((vendor.status === "active" && !isVendorRenewalExpired(vendor)) ||
          vendor.status === "pending")
      );
    }
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <Header isVendorLoggedIn={isVendorLoggedIn} />
        <main className="min-h-screen">{children}</main>
        <VendorFloatingButton isVendorLoggedIn={isVendorLoggedIn} />
        <AppToaster />
        <Footer />
      </body>
    </html>
  );
}
