"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Search,
  SquarePen,
  Store,
  Trash2,
  X,
} from "lucide-react";

type TabId = "overview" | "vendors" | "products" | "leads";

export type VendorRow = {
  id: string;
  name: string;
  owner: string;
  address: string;
  products: number;
  joined: string;
  status: "Active" | "Inactive";
  mobile: string;
  email: string;
  whatsapp: string;
};

export type ProductRow = {
  id: string;
  name: string;
  vendor: string;
  city: string;
  price: string;
  image: string;
  hidden: boolean;
};

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  date: string;
  source: string;
  status: "new" | "in_progress" | "contacted" | "closed";
  notes: string;
};

const PAGE_SIZE = 8;

type AdminDashboardClientProps = {
  activeTab?: string;
  onLogoutAction: (formData: FormData) => void | Promise<void>;
  onUpdateVendorAction: (input: {
    vendorId: string;
    name: string;
    companyName: string;
    address: string;
    whatsapp: string;
    status: "Active" | "Inactive";
  }) => Promise<{ ok: boolean; error?: string }>;
  onDeleteVendorAction: (vendorId: string) => Promise<{ ok: boolean; error?: string }>;
  onToggleProductVisibilityAction: (input: {
    productId: string;
    hidden: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  onDeleteProductAction: (productId: string) => Promise<{ ok: boolean; error?: string }>;
  onUpdateLeadAction: (input: {
    leadId: string;
    status: LeadRow["status"];
    notes: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  onDeleteLeadAction: (leadId: string) => Promise<{ ok: boolean; error?: string }>;
  initialVendors: VendorRow[];
  initialProducts: ProductRow[];
  initialLeads: LeadRow[];
};

const tabs: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "vendors", label: "Vendors", icon: Store },
  { id: "products", label: "Products", icon: Package },
  { id: "leads", label: "Leads", icon: Mail },
];

function normalizeTab(input?: string): TabId {
  if (input === "vendors" || input === "products" || input === "leads") {
    return input;
  }
  return "overview";
}

function statusPill(status: string) {
  if (status === "Active" || status === "Visible") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "Inactive" || status === "Hidden") {
    return "bg-red-50 text-red-700";
  }
  return "bg-[var(--secondary)] text-[var(--black)]";
}

function leadStatusPill(status: LeadRow["status"]) {
  switch (status) {
    case "new":
      return "bg-sky-50 text-sky-700";
    case "in_progress":
      return "bg-amber-50 text-amber-700";
    case "contacted":
      return "bg-emerald-50 text-emerald-700";
    case "closed":
      return "bg-[var(--secondary)] text-[var(--black)]";
    default:
      return "bg-[var(--secondary)] text-[var(--black)]";
  }
}

function leadStatusLabel(status: LeadRow["status"]) {
  switch (status) {
    case "new":
      return "New";
    case "in_progress":
      return "In Progress";
    case "contacted":
      return "Contacted";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

export default function AdminDashboardClient({
  activeTab,
  onLogoutAction,
  onUpdateVendorAction,
  onDeleteVendorAction,
  onToggleProductVisibilityAction,
  onDeleteProductAction,
  onUpdateLeadAction,
  onDeleteLeadAction,
  initialVendors,
  initialProducts,
  initialLeads,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = useState<TabId>(normalizeTab(activeTab));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState<"All" | "Visible" | "Hidden">("All");
  const [vendors, setVendors] = useState(initialVendors);
  const [products, setProducts] = useState(initialProducts);
  const [leads, setLeads] = useState(initialLeads);
  const [editingVendor, setEditingVendor] = useState<VendorRow | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<VendorRow | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductRow | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [deletingLead, setDeletingLead] = useState<LeadRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [vendorPage, setVendorPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [leadPage, setLeadPage] = useState(1);

  useEffect(() => {
    setSelectedTab(normalizeTab(activeTab));
  }, [activeTab]);

  useEffect(() => {
    setVendors(initialVendors);
  }, [initialVendors]);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  useEffect(() => {
    setVendorPage(1);
  }, [vendorSearch, vendorFilter]);

  useEffect(() => {
    setProductPage(1);
  }, [productSearch, productFilter]);

  useEffect(() => {
    setLeadPage(1);
  }, [leads.length]);

  const activeVendors = vendors.filter((vendor) => vendor.status === "Active").length;
  const inactiveVendors = vendors.length - activeVendors;
  const visibleProducts = products.filter((product) => !product.hidden).length;

  const filteredVendors = vendors.filter((vendor) => {
    const matchesFilter = vendorFilter === "All" ? true : vendor.status === vendorFilter;
    const query = vendorSearch.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      vendor.name.toLowerCase().includes(query) ||
      vendor.owner.toLowerCase().includes(query) ||
      vendor.address.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const filteredProducts = products.filter((product) => {
    const currentStatus = product.hidden ? "Hidden" : "Visible";
    const matchesFilter = productFilter === "All" ? true : currentStatus === productFilter;
    const query = productSearch.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      product.name.toLowerCase().includes(query) ||
      product.vendor.toLowerCase().includes(query) ||
      product.city.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const vendorTotalPages = Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const leadTotalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));

  const paginatedVendors = filteredVendors.slice((vendorPage - 1) * PAGE_SIZE, vendorPage * PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
  const paginatedLeads = leads.slice((leadPage - 1) * PAGE_SIZE, leadPage * PAGE_SIZE);

  function updateVendorField<K extends keyof VendorRow>(field: K, value: VendorRow[K]) {
    if (!editingVendor) {
      return;
    }

    setEditingVendor({ ...editingVendor, [field]: value });
  }

  function saveVendorProfile() {
    if (!editingVendor) {
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const result = await onUpdateVendorAction({
        vendorId: editingVendor.id,
        name: editingVendor.owner,
        companyName: editingVendor.name,
        address: editingVendor.address,
        whatsapp: editingVendor.whatsapp,
        status: editingVendor.status,
      });

      if (!result.ok) {
        setActionError(result.error ?? "Unable to update vendor.");
        return;
      }

      setEditingVendor(null);
      router.refresh();
    });
  }

  function confirmDeleteVendor() {
    if (!deletingVendor) {
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const result = await onDeleteVendorAction(deletingVendor.id);
      if (!result.ok) {
        setActionError(result.error ?? "Unable to delete vendor.");
        return;
      }

      setDeletingVendor(null);
      router.refresh();
    });
  }

  function toggleProductVisibility(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const result = await onToggleProductVisibilityAction({
        productId,
        hidden: !product.hidden,
      });

      if (!result.ok) {
        setActionError(result.error ?? "Unable to update product.");
        return;
      }

      router.refresh();
    });
  }

  function deleteProduct(productId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await onDeleteProductAction(productId);
      if (!result.ok) {
        setActionError(result.error ?? "Unable to delete product.");
        return;
      }

      router.refresh();
    });
  }

  function saveLead() {
    if (!selectedLead) {
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const result = await onUpdateLeadAction({
        leadId: selectedLead.id,
        status: selectedLead.status,
        notes: selectedLead.notes,
      });

      if (!result.ok) {
        setActionError(result.error ?? "Unable to update lead.");
        return;
      }

      setSelectedLead(null);
      router.refresh();
    });
  }

  function confirmDeleteLead() {
    if (!deletingLead) {
      return;
    }

    setActionError(null);
    startTransition(async () => {
      const result = await onDeleteLeadAction(deletingLead.id);
      if (!result.ok) {
        setActionError(result.error ?? "Unable to delete lead.");
        return;
      }

      setDeletingLead(null);
      if (selectedLead?.id === deletingLead.id) {
        setSelectedLead(null);
      }
      router.refresh();
    });
  }

  function Pagination({
    page,
    totalPages,
    onPageChange,
  }: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-sm text-[var(--black)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-xl px-3 py-2 text-sm ${
              pageNumber === page
                ? "bg-[var(--black)] text-white"
                : "border border-[var(--lightgray)] bg-white text-[var(--black)]"
            }`}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-sm text-[var(--black)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#f6f1ea_0%,#efe7dc_100%)] px-4 py-4 md:px-6 md:py-6">
      <style>{`
        .admin-content-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .admin-content-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className={`mx-auto max-w-7xl lg:grid lg:h-[calc(100vh-3rem)] lg:gap-6 lg:overflow-hidden ${
          sidebarCollapsed ? "lg:grid-cols-[96px_minmax(0,1fr)]" : "lg:grid-cols-[280px_minmax(0,1fr)]"
        }`}
      >
        <aside
          className={`rounded-[28px] border border-white/80 bg-[linear-gradient(180deg,#2e2a26_0%,#1f1c19_100%)] p-4 text-white shadow-2xl lg:h-[calc(100vh-3rem)] ${
            sidebarCollapsed ? "lg:w-[96px]" : "lg:w-[280px]"
          }`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
            <div className={sidebarCollapsed ? "hidden" : "block"}>
              <p className="text-xs uppercase tracking-[0.28em] text-white/60">Ratlami Interio</p>
              <h1 className="mt-3 text-2xl font-semibold">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-white/70">
                Vendors, products, and leads in one workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSidebarCollapsed((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 transition hover:bg-white/15"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <nav className="mt-6 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = selectedTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex w-full items-center rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "bg-white text-[var(--black)] shadow-sm"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  } ${sidebarCollapsed ? "justify-center" : "gap-3"}`}
                >
                  <Icon size={18} />
                  {sidebarCollapsed ? null : <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          <form action={onLogoutAction} className="mt-8 lg:mt-10">
            <button
              type="submit"
              className={`flex w-full items-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 ${
                sidebarCollapsed ? "justify-center px-0" : "gap-3 justify-start"
              }`}
            >
              <LogOut size={18} />
              {sidebarCollapsed ? null : "Logout"}
            </button>
          </form>
        </aside>

        <div className="admin-content-scroll space-y-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2">
          {actionError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          ) : null}

          <header className="rounded-[28px] border border-white/70 bg-white/88 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--darkgray)]">Admin Control Center</p>
                <h2 className="mt-2 text-3xl font-semibold text-[var(--black)]">
                  {selectedTab === "overview"
                    ? "Overview"
                    : selectedTab === "vendors"
                      ? "Vendor Management"
                      : selectedTab === "products"
                        ? "Product Management"
                        : "Lead Inbox"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[var(--darkgray)]">
                  Review the marketplace, manage listings, and keep operations clean.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-[var(--lightgray)]/70 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Total Vendors</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{vendors.length}</p>
              </div>
              <div className="rounded-3xl border border-[var(--lightgray)]/70 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Total Products</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{products.length}</p>
              </div>
              <div className="rounded-3xl border border-[var(--lightgray)]/70 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Active Vendors</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{activeVendors}</p>
              </div>
              <div className="rounded-3xl border border-[var(--lightgray)]/70 bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Inactive Vendors</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{inactiveVendors}</p>
              </div>
            </div>
          </header>

          {selectedTab === "overview" ? (
            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-[var(--black)]">Operational Summary</h3>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[var(--secondary)] p-5">
                    <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Visible Products</p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--black)]">{visibleProducts}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--secondary)] p-5">
                    <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Hidden Products</p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--black)]">{products.length - visibleProducts}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--secondary)] p-5">
                    <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Leads Received</p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--black)]">{leads.length}</p>
                  </div>
                  <div className="rounded-2xl bg-[var(--secondary)] p-5">
                    <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Need Attention</p>
                    <p className="mt-3 text-2xl font-semibold text-[var(--black)]">
                      {inactiveVendors + products.filter((product) => product.hidden).length}
                    </p>
                  </div>
                </div>
            </div>
          ) : null}

          {selectedTab === "vendors" ? (
            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--black)]">Vendor List</h3>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">
                    Search, filter, edit profile details, or remove a vendor profile.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["All", "Active", "Inactive"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setVendorFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        vendorFilter === filter
                          ? "bg-[var(--black)] text-white"
                          : "border border-[var(--lightgray)] text-[var(--black)]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <label className="relative min-w-[260px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--darkgray)]" />
                  <input
                    value={vendorSearch}
                    onChange={(event) => setVendorSearch(event.target.value)}
                    placeholder="Search vendor, owner, or address"
                    className="w-full rounded-2xl border border-[var(--lightgray)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                  />
                </label>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--darkgray)]">
                      <th className="px-4 py-2 font-medium">Vendor</th>
                      <th className="px-4 py-2 font-medium">Address</th>
                      <th className="px-4 py-2 font-medium">Products</th>
                      <th className="px-4 py-2 font-medium">Joined</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVendors.map((vendor) => (
                      <tr key={vendor.id} className="bg-[var(--secondary)]/35">
                        <td className="rounded-l-2xl px-4 py-4">
                          <p className="font-semibold text-[var(--black)]">{vendor.name}</p>
                          <p className="mt-1 text-sm text-[var(--darkgray)]">{vendor.owner}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.address}</td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.products}</td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.joined}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setActionError(null);
                                setEditingVendor(vendor);
                              }}
                              disabled={isPending}
                              className="inline-flex items-center gap-2 rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]"
                            >
                              <SquarePen size={14} />
                              Edit Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionError(null);
                                setDeletingVendor(vendor);
                              }}
                              disabled={isPending}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                            >
                              <Trash2 size={14} />
                              Delete Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={vendorPage} totalPages={vendorTotalPages} onPageChange={setVendorPage} />
            </div>
          ) : null}

          {selectedTab === "products" ? (
            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--black)]">All Products</h3>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">
                    Review all products, hide or unhide them, and remove invalid listings.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["All", "Visible", "Hidden"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setProductFilter(filter)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        productFilter === filter
                          ? "bg-[var(--black)] text-white"
                          : "border border-[var(--lightgray)] text-[var(--black)]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <label className="relative min-w-[260px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--darkgray)]" />
                  <input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search product, vendor, or city"
                    className="w-full rounded-2xl border border-[var(--lightgray)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                  />
                </label>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--darkgray)]">
                      <th className="px-4 py-2 font-medium">Product Name</th>
                      <th className="px-4 py-2 font-medium">Vendor Name</th>
                      <th className="px-4 py-2 font-medium">Price</th>
                      <th className="px-4 py-2 font-medium">Product Image</th>
                      <th className="px-4 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="bg-[var(--secondary)]/35">
                        <td className="rounded-l-2xl px-4 py-4">
                          <p className="font-semibold text-[var(--black)]">{product.name}</p>
                          <p className="mt-1 text-sm text-[var(--darkgray)]">{product.city}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{product.vendor}</td>
                        <td className="px-4 py-4 text-sm font-medium text-[var(--black)]">{product.price}</td>
                        <td className="px-4 py-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                        </td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => toggleProductVisibility(product.id)}
                              disabled={isPending}
                              className="rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]"
                            >
                              {product.hidden ? "Unhide" : "Hide"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionError(null);
                                setDeletingProduct(product);
                              }}
                              disabled={isPending}
                              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={productPage} totalPages={productTotalPages} onPageChange={setProductPage} />
            </div>
          ) : null}

          {selectedTab === "leads" ? (
            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--black)]">Contact Leads</h3>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">
                    Messages submitted from the website contact page appear here.
                  </p>
                </div>
              </div>

              {leads.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[var(--lightgray)] bg-[var(--secondary)]/40 p-8 text-center text-sm text-[var(--darkgray)]">
                  No leads yet. New contact submissions will appear here.
                </div>
              ) : (
                <>
                  <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-[var(--darkgray)]">
                          <th className="px-4 py-2 font-medium">Name</th>
                          <th className="px-4 py-2 font-medium">Phone</th>
                          <th className="px-4 py-2 font-medium">Email</th>
                          <th className="px-4 py-2 font-medium">Date</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Source</th>
                          <th className="px-4 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedLeads.map((lead) => (
                          <tr key={lead.id} className="bg-[var(--secondary)]/35">
                            <td className="rounded-l-2xl px-4 py-4">
                              <p className="text-sm font-medium text-[var(--black)]">{lead.name}</p>
                              <p className="mt-1 line-clamp-2 max-w-sm text-sm text-[var(--darkgray)]">{lead.message}</p>
                            </td>
                            <td className="px-4 py-4 text-sm text-[var(--black)]">{lead.phone}</td>
                            <td className="px-4 py-4 text-sm text-[var(--black)]">{lead.email}</td>
                            <td className="px-4 py-4 text-sm text-[var(--black)]">{lead.date}</td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${leadStatusPill(lead.status)}`}>
                                {leadStatusLabel(lead.status)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-[var(--black)]">{lead.source}</td>
                            <td className="rounded-r-2xl px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionError(null);
                                    setSelectedLead(lead);
                                  }}
                                  disabled={isPending}
                                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-sm font-medium text-[var(--black)]"
                                >
                                  <Eye size={14} />
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionError(null);
                                    setDeletingLead(lead);
                                  }}
                                  disabled={isPending}
                                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={leadPage} totalPages={leadTotalPages} onPageChange={setLeadPage} />
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {editingVendor ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--black)]">Edit Vendor Profile</h3>
                <p className="mt-1 text-sm text-[var(--darkgray)]">
                  Mobile and email are read-only in this admin form.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setEditingVendor(null);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--lightgray)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Vendor Name</span>
                <input
                  value={editingVendor.name}
                  onChange={(event) => updateVendorField("name", event.target.value)}
                  className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Owner Name</span>
                <input
                  value={editingVendor.owner}
                  onChange={(event) => updateVendorField("owner", event.target.value)}
                  className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Status</span>
                <select
                  value={editingVendor.status}
                  onChange={(event) =>
                    updateVendorField("status", event.target.value as VendorRow["status"])
                  }
                  className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Address</span>
                <textarea
                  rows={3}
                  value={editingVendor.address}
                  onChange={(event) => updateVendorField("address", event.target.value)}
                  className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">WhatsApp</span>
                <input
                  value={editingVendor.whatsapp}
                  onChange={(event) => updateVendorField("whatsapp", event.target.value)}
                  className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                />
              </label>
              <div className="rounded-xl border border-[var(--lightgray)] bg-[var(--secondary)] px-3 py-2.5">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Products</span>
                <p className="text-sm text-[var(--darkgray)]">{editingVendor.products} products linked to this vendor</p>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Mobile</span>
                <input
                  value={editingVendor.mobile}
                  disabled
                  className="w-full rounded-xl border border-[var(--lightgray)] bg-[var(--secondary)] px-3 py-2.5 text-sm text-[var(--darkgray)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Email</span>
                <input
                  value={editingVendor.email}
                  disabled
                  className="w-full rounded-xl border border-[var(--lightgray)] bg-[var(--secondary)] px-3 py-2.5 text-sm text-[var(--darkgray)]"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setEditingVendor(null);
                }}
                disabled={isPending}
                className="rounded-xl border border-[var(--lightgray)] px-4 py-2.5 text-sm font-medium text-[var(--black)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveVendorProfile}
                disabled={isPending}
                className="rounded-xl bg-[var(--black)] px-4 py-2.5 text-sm font-medium text-white"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingVendor ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--black)]">Delete Vendor Profile?</h3>
                <p className="mt-2 text-sm text-[var(--darkgray)]">
                  Deleting this profile will delete all the products this vendor has.
                </p>
                <p className="mt-2 text-sm text-[var(--darkgray)]">
                  Vendor: <span className="font-medium text-[var(--black)]">{deletingVendor.name}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setDeletingVendor(null);
                }}
                disabled={isPending}
                className="rounded-xl border border-[var(--lightgray)] px-4 py-2.5 text-sm font-medium text-[var(--black)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteVendor}
                disabled={isPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingProduct ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--black)]">Delete Product?</h3>
                <p className="mt-2 text-sm text-[var(--darkgray)]">
                  This will permanently remove the product from the marketplace.
                </p>
                <p className="mt-2 text-sm text-[var(--darkgray)]">
                  Product: <span className="font-medium text-[var(--black)]">{deletingProduct.name}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setDeletingProduct(null);
                }}
                disabled={isPending}
                className="rounded-xl border border-[var(--lightgray)] px-4 py-2.5 text-sm font-medium text-[var(--black)]"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  const productId = deletingProduct.id;
                  setDeletingProduct(null);
                  deleteProduct(productId);
                }}
                disabled={isPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                {isPending ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedLead ? (
        <div className="fixed inset-0 z-[97] flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--black)]">Lead Details</h3>
                <p className="mt-1 text-sm text-[var(--darkgray)]">Review the inquiry and update its progress.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setSelectedLead(null);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--lightgray)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-[var(--secondary)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Name</p>
                <p className="mt-1 text-sm font-medium text-[var(--black)]">{selectedLead.name}</p>
              </div>
              <div className="rounded-xl bg-[var(--secondary)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Date</p>
                <p className="mt-1 text-sm font-medium text-[var(--black)]">{selectedLead.date}</p>
              </div>
              <div className="rounded-xl bg-[var(--secondary)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Phone</p>
                <p className="mt-1 text-sm font-medium text-[var(--black)]">{selectedLead.phone}</p>
              </div>
              <div className="rounded-xl bg-[var(--secondary)] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Email</p>
                <p className="mt-1 break-all text-sm font-medium text-[var(--black)]">{selectedLead.email}</p>
              </div>
              <div className="rounded-xl bg-[var(--secondary)] px-4 py-3 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Message</p>
                <p className="mt-1 text-sm text-[var(--black)]">{selectedLead.message}</p>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Status</span>
                <select
                  value={selectedLead.status}
                  onChange={(event) =>
                    setSelectedLead({ ...selectedLead, status: event.target.value as LeadRow["status"] })
                  }
                  className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <div className="flex items-end gap-2">
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-xl border border-[var(--lightgray)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--black)]"
                >
                  WhatsApp
                </a>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="inline-flex rounded-xl border border-[var(--lightgray)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--black)]"
                >
                  Call
                </a>
              </div>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Notes</span>
                <textarea
                  rows={4}
                  value={selectedLead.notes}
                  onChange={(event) => setSelectedLead({ ...selectedLead, notes: event.target.value })}
                  placeholder="Add internal notes, callback info, budget, follow-up details..."
                  className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setSelectedLead(null);
                }}
                disabled={isPending}
                className="rounded-xl border border-[var(--lightgray)] px-4 py-2.5 text-sm font-medium text-[var(--black)]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={saveLead}
                disabled={isPending}
                className="rounded-xl bg-[var(--black)] px-4 py-2.5 text-sm font-medium text-white"
              >
                {isPending ? "Saving..." : "Save Lead"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deletingLead ? (
        <div className="fixed inset-0 z-[98] flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[var(--black)]">Delete Lead?</h3>
                <p className="mt-2 text-sm text-[var(--darkgray)]">
                  This will permanently remove the lead record from the dashboard.
                </p>
                <p className="mt-2 text-sm text-[var(--darkgray)]">
                  Lead: <span className="font-medium text-[var(--black)]">{deletingLead.name}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionError(null);
                  setDeletingLead(null);
                }}
                disabled={isPending}
                className="rounded-xl border border-[var(--lightgray)] px-4 py-2.5 text-sm font-medium text-[var(--black)]"
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmDeleteLead}
                disabled={isPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white"
              >
                {isPending ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
