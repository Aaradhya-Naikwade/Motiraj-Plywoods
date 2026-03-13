"use client";

import { ReactNode, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Images, LayoutDashboard, LogOut, Menu, UploadCloud, User, X } from "lucide-react";

type VendorDashboardTab = "analytics" | "profile" | "add-products" | "manage-products";

type VendorDashboardShellProps = {
  activeTab: VendorDashboardTab;
  companyName: string;
  status: string;
  onLogoutAction: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
};

const navItems: Array<{
  key: VendorDashboardTab;
  label: string;
  shortLabel: string;
  href: string;
  icon: typeof LayoutDashboard;
}> = [
    {
      key: "analytics",
      label: "Analytics",
      shortLabel: "Analytics",
      href: "/vendor/dashboard?tab=analytics",
      icon: LayoutDashboard,
    },
    {
      key: "profile",
      label: "Profile",
      shortLabel: "Profile",
      href: "/vendor/dashboard?tab=profile",
      icon: User,
    },
    {
      key: "add-products",
      label: "Add Products",
      shortLabel: "Add Products",
      href: "/vendor/dashboard?tab=add-products",
      icon: UploadCloud,
    },
    {
      key: "manage-products",
      label: "Manage Products",
      shortLabel: "Manage Products",
      href: "/vendor/dashboard?tab=manage-products",
      icon: Images,
    },
  ];

export default function VendorDashboardShell({
  activeTab,
  companyName,
  status,
  onLogoutAction,
  children,
}: VendorDashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItem = useMemo(
    () => navItems.find((item) => item.key === activeTab) ?? navItems[0],
    [activeTab]
  );

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#f7f2eb_0%,_#efe6dc_42%,_#e6dacc_100%)] lg:h-[100svh]">
      <div className="lg:grid lg:h-[100svh] lg:grid-cols-[auto_minmax(0,1fr)] lg:overflow-hidden">
        {mobileOpen ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/35 lg:hidden"
            aria-label="Close sidebar"
          />
        ) : null}

        <aside
          className={`fixed left-0 top-0 z-50 h-[100svh] w-[280px] border-r border-[#e6dacc] bg-[#fbf7f2] shadow-[0_24px_60px_-40px_rgba(43,25,6,0.35)] transition-transform duration-300 lg:sticky lg:top-0 lg:h-[100svh] lg:translate-x-0 lg:shadow-none ${mobileOpen ? "translate-x-0" : "-translate-x-full"
            } ${sidebarCollapsed ? "lg:w-[96px]" : "lg:w-[280px]"}`}
        >
          <div className="flex h-full min-h-0 flex-col overflow-hidden p-4">
            <div className="flex items-start justify-between gap-3 border-b border-[#eadfd2] pb-4">
              <div className={sidebarCollapsed ? "lg:hidden" : "block"}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a5b31]">{companyName}</p>
                <h2 className="mt-2 text-xl font-semibold text-[var(--black)]">Vendor Desk</h2>
                <p className="mt-1 text-sm text-[var(--darkgray)]">Simple workspace for your catalogue.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed((current) => !current)}
                  className="hidden h-10 w-10 items-center justify-center rounded-full border border-[#ddd0c2] bg-white text-[var(--black)] lg:inline-flex"
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd0c2] bg-white text-[var(--black)] lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <nav className="scrollbar-hidden mt-5 min-h-0 space-y-2 overflow-y-auto pr-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === activeTab;
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition ${isActive
                        ? "bg-[var(--primary)] text-white shadow-[0_18px_34px_-22px_rgba(73,36,10,0.52)]"
                        : "text-[var(--black)] hover:bg-white hover:shadow-sm"
                      } ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""}`}
                    title={item.label}
                  >
                    <Icon size={18} />
                    <span className={sidebarCollapsed ? "lg:hidden" : ""}>{item.label}</span>
                  </a>
                );
              })}
              <form action={onLogoutAction}>
                <button
                  type="submit"
                  className={`mt-2 flex w-full items-center gap-3 rounded-[20px] border border-[#eadfd2] bg-white px-4 py-3 text-sm font-semibold text-[var(--black)] transition hover:bg-[#f7f1e8] ${sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
                    }`}
                >
                  <LogOut size={18} />
                  <span className={sidebarCollapsed ? "lg:hidden" : ""}>Logout</span>
                </button>
              </form>
            </nav>
          </div>
        </aside>
                    
        <div className="scrollbar-hidden min-w-0 px-3 py-3 md:px-4 md:py-4 lg:h-[100svh] lg:overflow-y-auto lg:px-5 lg:py-5">
          <div className="mb-4 flex items-center justify-between rounded-[26px] border border-white/75 bg-white/88 px-4 py-3 shadow-sm backdrop-blur md:px-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd0c2] bg-white text-[var(--black)] lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--darkgray)]">
                  Vendor Dashboard
                </p>
                <h1 className="mt-1 text-lg font-semibold text-[var(--black)] md:text-2xl">{activeItem.shortLabel}</h1>
              </div>
            </div>
            <span className="hidden rounded-full bg-[#f3ece3] px-3 py-1 text-xs font-semibold capitalize text-[#8a5b31] md:inline-flex">
              {status}
            </span>
          </div>

          <div className="space-y-5">{children}</div>
        </div>
      </div>
    </section>
  );
}
