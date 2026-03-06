import Image from "next/image";
import { Bell, CreditCard, Heart, MapPin, Package, Settings } from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-[var(--secondary)] px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-12">
        <section className="rounded-2xl bg-white p-6 shadow-lg md:col-span-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[var(--primary)]">
              <Image src="/image/user.jpg" alt="Profile picture" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--black)]">Ratlami Customer</h1>
              <p className="text-sm text-[var(--darkgray)]">customer@ratlamiinterio.com</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center gap-3 rounded-lg border border-[var(--lightgray)] px-3 py-2 text-left text-sm text-[var(--black)] transition hover:border-[var(--primary)]">
              <Settings className="h-4 w-4 text-[var(--primary)]" />
              Account Settings
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg border border-[var(--lightgray)] px-3 py-2 text-left text-sm text-[var(--black)] transition hover:border-[var(--primary)]">
              <Bell className="h-4 w-4 text-[var(--primary)]" />
              Notifications
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg border border-[var(--lightgray)] px-3 py-2 text-left text-sm text-[var(--black)] transition hover:border-[var(--primary)]">
              <CreditCard className="h-4 w-4 text-[var(--primary)]" />
              Payments
            </button>
          </div>
        </section>

        <section className="space-y-6 md:col-span-8">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-[var(--black)]">Recent Activity</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-[var(--lightgray)] p-4">
                <Package className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-2 text-sm font-medium text-[var(--black)]">Orders</p>
                <p className="text-xs text-[var(--darkgray)]">2 active orders</p>
              </article>
              <article className="rounded-xl border border-[var(--lightgray)] p-4">
                <Heart className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-2 text-sm font-medium text-[var(--black)]">Wishlist</p>
                <p className="text-xs text-[var(--darkgray)]">9 saved products</p>
              </article>
              <article className="rounded-xl border border-[var(--lightgray)] p-4">
                <MapPin className="h-5 w-5 text-[var(--primary)]" />
                <p className="mt-2 text-sm font-medium text-[var(--black)]">Addresses</p>
                <p className="text-xs text-[var(--darkgray)]">1 default address</p>
              </article>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-[var(--black)]">Account Details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Full Name</span>
                <input
                  type="text"
                  defaultValue="Ratlami Customer"
                  className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Phone Number</span>
                <input
                  type="tel"
                  defaultValue="+91 98765 43210"
                  className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Email Address</span>
                <input
                  type="email"
                  defaultValue="customer@ratlamiinterio.com"
                  className="w-full rounded-lg border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                />
              </label>
            </div>
            <button className="mt-5 inline-flex rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              Save Changes
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
