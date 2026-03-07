import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VendorFloatingButton from "@/components/VendorFloatingButton";
import AppToaster from "@/components/AppToaster";
import { VENDOR_AUTH_COOKIE } from "@/lib/auth-cookies";

export const metadata: Metadata = {
  title: "Ratlami Interio",
  description: "Interior & Vendors Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isVendorLoggedIn = Boolean(cookieStore.get(VENDOR_AUTH_COOKIE)?.value);

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
