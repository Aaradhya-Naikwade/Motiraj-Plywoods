"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Share2,
  Search,
  SquarePen,
  Store,
  Trash2,
  X,
} from "lucide-react";

type TabId = "overview" | "vendors" | "products" | "catalogues" | "likes" | "leads" | "leaders";

export type VendorRow = {
  id: string;
  name: string;
  owner: string;
  catalogueSlug: string;
  address: string;
  products: number;
  joined: string;
  renewalDue: string;
  renewedOn: string;
  catalogueShares: number;
  catalogueViews: number;
  lastSharedAt: string;
  lastViewedAt: string;
  totalLikes: number;
  status: "Active" | "Inactive" | "Locked" | "Pending";
  mobile: string;
  email: string;
  dob: string;
  whatsapp: string;
};

export type ProductRow = {
  id: string;
  category: string;
  imageName: string;
  vendor: string;
  image: string;
  likes: number;
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

export type IndustryLeaderRow = {
  role: "president" | "secretary" | "top_performer";
  name: string;
  designation: string;
  message: string;
  imageUrl: string;
};

type IndustryLeaderFormRow = IndustryLeaderRow & {
  imageFile: File | null;
};

const PAGE_SIZE = 8;
const INDUSTRY_LEADER_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

type AdminDashboardClientProps = {
  activeTab?: string;
  onLogoutAction: (formData: FormData) => void | Promise<void>;
  onUpdateVendorAction: (input: {
    vendorId: string;
    name: string;
    companyName: string;
    address: string;
    whatsapp: string;
    dob: string;
    status: "Active" | "Inactive" | "Locked" | "Pending";
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
  onUpdateIndustryLeadersAction: (input: {
    formData: FormData;
  }) => Promise<{ ok: boolean; error?: string }>;
  initialVendors: VendorRow[];
  initialProducts: ProductRow[];
  initialLeads: LeadRow[];
  initialIndustryLeaders: IndustryLeaderRow[];
};

const tabs: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "vendors", label: "Vendors", icon: Store },
  { id: "products", label: "Products", icon: Package },
  { id: "catalogues", label: "Catalogue", icon: Share2 },
  { id: "likes", label: "Likes", icon: Heart },
  { id: "leads", label: "Leads", icon: Mail },
  { id: "leaders", label: "Leaders", icon: Crown },
];

function normalizeTab(input?: string): TabId {
  if (input === "vendors" || input === "products" || input === "catalogues" || input === "likes" || input === "leads" || input === "leaders") {
    return input;
  }
  return "overview";
}

function statusPill(status: string) {
  if (status === "Active" || status === "Visible") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "Locked") {
    return "bg-amber-100 text-amber-800";
  }
  if (status === "Pending") {
    return "bg-sky-100 text-sky-800";
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
  onUpdateIndustryLeadersAction,
  initialVendors,
  initialProducts,
  initialLeads,
  initialIndustryLeaders,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTab, setSelectedTab] = useState<TabId>(normalizeTab(activeTab));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState<"All" | "Active" | "Inactive" | "Locked" | "Pending">("All");
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState<"All" | "Visible" | "Hidden">("All");
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [likesSearch, setLikesSearch] = useState("");
  const [vendors, setVendors] = useState(initialVendors);
  const [products, setProducts] = useState(initialProducts);
  const [leads, setLeads] = useState(initialLeads);
  const [industryLeaders, setIndustryLeaders] = useState<IndustryLeaderFormRow[]>(
    initialIndustryLeaders.map((leader) => ({ ...leader, imageFile: null }))
  );
  const [editingVendor, setEditingVendor] = useState<VendorRow | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<VendorRow | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductRow | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [deletingLead, setDeletingLead] = useState<LeadRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [vendorPage, setVendorPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [cataloguePage, setCataloguePage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);
  const [leadPage, setLeadPage] = useState(1);
  const dobMaxDate = new Date();
  dobMaxDate.setFullYear(dobMaxDate.getFullYear() - 18);
  const maxDobValue = dobMaxDate.toISOString().slice(0, 10);

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
    setIndustryLeaders(initialIndustryLeaders.map((leader) => ({ ...leader, imageFile: null })));
  }, [initialIndustryLeaders]);

  useEffect(() => {
    setVendorPage(1);
  }, [vendorSearch, vendorFilter]);

  useEffect(() => {
    setProductPage(1);
  }, [productSearch, productFilter]);

  useEffect(() => {
    setCataloguePage(1);
  }, [catalogueSearch]);

  useEffect(() => {
    setLikesPage(1);
  }, [likesSearch]);

  useEffect(() => {
    setLeadPage(1);
  }, [leads.length]);

  const activeVendors = vendors.filter((vendor) => vendor.status === "Active").length;
  const inactiveVendors = vendors.filter((vendor) => vendor.status === "Inactive").length;
  const lockedVendors = vendors.filter((vendor) => vendor.status === "Locked").length;
  const pendingVendors = vendors.filter((vendor) => vendor.status === "Pending").length;
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
      product.imageName.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.vendor.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  const filteredCatalogueVendors = vendors.filter((vendor) => {
    const query = catalogueSearch.trim().toLowerCase();
    return (
      query.length === 0 ||
      vendor.name.toLowerCase().includes(query) ||
      vendor.owner.toLowerCase().includes(query) ||
      vendor.catalogueSlug.toLowerCase().includes(query)
    );
  });

  const filteredLikedProducts = products.filter((product) => {
    const query = likesSearch.trim().toLowerCase();
    return (
      product.likes > 0 &&
      (
        query.length === 0 ||
        product.vendor.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.imageName.toLowerCase().includes(query)
      )
    );
  }).sort((a, b) => b.likes - a.likes);
  const totalLikedImages = filteredLikedProducts.length;
  const totalLikeVotes = filteredLikedProducts.reduce((sum, product) => sum + product.likes, 0);
  const topLikedProductVotes = filteredLikedProducts[0]?.likes ?? 0;

  const vendorTotalPages = Math.max(1, Math.ceil(filteredVendors.length / PAGE_SIZE));
  const productTotalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const catalogueTotalPages = Math.max(1, Math.ceil(filteredCatalogueVendors.length / PAGE_SIZE));
  const likesTotalPages = Math.max(1, Math.ceil(filteredLikedProducts.length / PAGE_SIZE));
  const leadTotalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));

  const paginatedVendors = filteredVendors.slice((vendorPage - 1) * PAGE_SIZE, vendorPage * PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice((productPage - 1) * PAGE_SIZE, productPage * PAGE_SIZE);
  const paginatedCatalogueVendors = filteredCatalogueVendors.slice((cataloguePage - 1) * PAGE_SIZE, cataloguePage * PAGE_SIZE);
  const paginatedLikedProducts = filteredLikedProducts.slice((likesPage - 1) * PAGE_SIZE, likesPage * PAGE_SIZE);
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
        dob: editingVendor.dob,
        status: editingVendor.status,
      });

      if (!result.ok) {
        setActionError(result.error ?? "Unable to update vendor.");
        toast.error(result.error ?? "Unable to update vendor.");
        return;
      }

      toast.success("Vendor profile updated.");
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
        toast.error(result.error ?? "Unable to delete vendor.");
        return;
      }

      toast.success("Vendor deleted successfully.");
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
        toast.error(result.error ?? "Unable to update product.");
        return;
      }

      toast.success(product.hidden ? "Product is now visible." : "Product hidden successfully.");
      router.refresh();
    });
  }

  function deleteProduct(productId: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await onDeleteProductAction(productId);
      if (!result.ok) {
        setActionError(result.error ?? "Unable to delete product.");
        toast.error(result.error ?? "Unable to delete product.");
        return;
      }

      toast.success("Product deleted successfully.");
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
        toast.error(result.error ?? "Unable to update lead.");
        return;
      }

      toast.success("Lead updated successfully.");
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
        toast.error(result.error ?? "Unable to delete lead.");
        return;
      }

      toast.success("Lead deleted successfully.");
      setDeletingLead(null);
      if (selectedLead?.id === deletingLead.id) {
        setSelectedLead(null);
      }
      router.refresh();
    });
  }

  function updateIndustryLeaderField(
    role: IndustryLeaderRow["role"],
    field: keyof Omit<IndustryLeaderFormRow, "role" | "imageFile">,
    value: string
  ) {
    setIndustryLeaders((current) =>
      current.map((leader) =>
        leader.role === role ? { ...leader, [field]: value } : leader
      )
    );
  }

  function updateIndustryLeaderImage(role: IndustryLeaderRow["role"], file: File | null) {
    if (file && file.size > INDUSTRY_LEADER_IMAGE_MAX_SIZE_BYTES) {
      toast.error("Leader image must be 5 MB or smaller.");
      return;
    }

    setIndustryLeaders((current) =>
      current.map((leader) =>
        leader.role === role ? { ...leader, imageFile: file } : leader
      )
    );
  }

  function saveIndustryLeaders() {
    setActionError(null);
    startTransition(async () => {
      const formData = new FormData();
      for (const leader of industryLeaders) {
        formData.set(`name_${leader.role}`, leader.name);
        formData.set(`designation_${leader.role}`, leader.designation);
        formData.set(`message_${leader.role}`, leader.message);
        formData.set(`imageUrl_${leader.role}`, leader.imageUrl);
        if (leader.imageFile) {
          formData.set(`imageFile_${leader.role}`, leader.imageFile);
        }
      }

      const result = await onUpdateIndustryLeadersAction({ formData });
      if (!result.ok) {
        setActionError(result.error ?? "Unable to update industry leaders.");
        toast.error(result.error ?? "Unable to update industry leaders.");
        return;
      }
      toast.success("Industry leaders updated successfully.");
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
                      : selectedTab === "catalogues"
                        ? "Catalogue Sharing"
                      : selectedTab === "likes"
                        ? "Likes Board"
                      : selectedTab === "leads"
                          ? "Lead Inbox"
                          : "Industry Leaders"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[var(--darkgray)]">
                  Review the marketplace, manage listings, and keep operations clean.
                </p>
              </div>
            </div>

          </header>

          {selectedTab === "overview" ? (
            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
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
                  <div className="rounded-3xl border border-[var(--lightgray)]/70 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Locked Vendors</p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{lockedVendors}</p>
                  </div>
                  <div className="rounded-3xl border border-[var(--lightgray)]/70 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">Pending Vendors</p>
                    <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{pendingVendors}</p>
                  </div>
                </div>
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
                      {inactiveVendors + lockedVendors + pendingVendors + products.filter((product) => product.hidden).length}
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
                  {(["All", "Active", "Inactive", "Locked", "Pending"] as const).map((filter) => (
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
                      <th className="px-4 py-2 font-medium">DOB</th>
                      <th className="px-4 py-2 font-medium">Renewal</th>
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
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.dob || "-"}</td>
                        <td className="px-4 py-4 text-xs text-[var(--darkgray)]">
                          <p>
                            <span className="font-medium text-[var(--black)]">Due:</span> {vendor.renewalDue}
                          </p>
                          <p className="mt-1">
                            <span className="font-medium text-[var(--black)]">Renewed:</span> {vendor.renewedOn}
                          </p>
                        </td>
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

          {selectedTab === "catalogues" ? (
            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--black)]">Catalogue Sharing</h3>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">
                    Review each vendor catalogue link, share clicks, and customer visits.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <label className="relative min-w-[260px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--darkgray)]" />
                  <input
                    value={catalogueSearch}
                    onChange={(event) => setCatalogueSearch(event.target.value)}
                    placeholder="Search vendor, owner, or catalogue slug"
                    className="w-full rounded-2xl border border-[var(--lightgray)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                  />
                </label>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--darkgray)]">
                      <th className="px-4 py-2 font-medium">Vendor</th>
                      <th className="px-4 py-2 font-medium">Catalogue Slug</th>
                      <th className="px-4 py-2 font-medium">Shares</th>
                      <th className="px-4 py-2 font-medium">Views</th>
                      <th className="px-4 py-2 font-medium">Last Shared</th>
                      <th className="px-4 py-2 font-medium">Last Viewed</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCatalogueVendors.map((vendor) => (
                      <tr key={vendor.id} className="bg-[var(--secondary)]/35">
                        <td className="rounded-l-2xl px-4 py-4">
                          <p className="font-semibold text-[var(--black)]">{vendor.name}</p>
                          <p className="mt-1 text-sm text-[var(--darkgray)]">{vendor.owner}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.catalogueSlug}</td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.catalogueShares}</td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.catalogueViews}</td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.lastSharedAt}</td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{vendor.lastViewedAt}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(vendor.status)}`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <a
                            href={`/vendor/catalogue/${vendor.catalogueSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]"
                          >
                            <Eye size={14} />
                            Open
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={cataloguePage} totalPages={catalogueTotalPages} onPageChange={setCataloguePage} />
            </div>
          ) : null}

          {selectedTab === "likes" ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] border border-white/75 bg-white/92 p-5 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--darkgray)]">Liked Images</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{totalLikedImages}</p>
                </div>
                <div className="rounded-[28px] border border-white/75 bg-white/92 p-5 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--darkgray)]">Total Likes</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{totalLikeVotes}</p>
                </div>
                <div className="rounded-[28px] border border-white/75 bg-white/92 p-5 shadow-xl">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--darkgray)]">Top Image Likes</p>
                  <p className="mt-3 text-3xl font-semibold text-[var(--black)]">{topLikedProductVotes}</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--black)]">Image Likes Leaderboard</h3>
                    <p className="mt-1 text-sm text-[var(--darkgray)]">
                      Ranked view of the most-liked catalogue images across all vendors.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <label className="relative min-w-[260px] flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--darkgray)]" />
                    <input
                      value={likesSearch}
                      onChange={(event) => setLikesSearch(event.target.value)}
                      placeholder="Search vendor, category, or image name"
                      className="w-full rounded-2xl border border-[var(--lightgray)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                    />
                  </label>
                </div>

                {filteredLikedProducts.length === 0 ? (
                  <div className="mt-6 rounded-3xl border border-dashed border-[var(--lightgray)] bg-white px-6 py-12 text-center">
                    <p className="text-base font-medium text-[var(--black)]">No liked images yet.</p>
                    <p className="mt-2 text-sm text-[var(--darkgray)]">
                      This tab will populate as visitors start liking catalogue images.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-y-3">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wide text-[var(--darkgray)]">
                            <th className="px-4 py-2 font-medium">Rank</th>
                            <th className="px-4 py-2 font-medium">Image</th>
                            <th className="px-4 py-2 font-medium">Vendor</th>
                            <th className="px-4 py-2 font-medium">Category</th>
                            <th className="px-4 py-2 font-medium">Likes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedLikedProducts.map((product, index) => (
                            <tr key={product.id} className="bg-[var(--secondary)]/35">
                              <td className="rounded-l-2xl px-4 py-4">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-[var(--black)] shadow-sm">
                                  {(likesPage - 1) * PAGE_SIZE + index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={product.image}
                                    alt={product.imageName}
                                    className="h-14 w-14 rounded-2xl object-cover"
                                  />
                                  <div>
                                    <p className="font-semibold text-[var(--black)]">{product.imageName}</p>
                                    <p className="mt-1 text-xs text-[var(--darkgray)]">Catalogue image</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-sm text-[var(--black)]">{product.vendor}</td>
                              <td className="px-4 py-4 text-sm text-[var(--black)]">{product.category}</td>
                              <td className="rounded-r-2xl px-4 py-4">
                                <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700">
                                  <Heart size={14} className="fill-current" />
                                  {product.likes}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination page={likesPage} totalPages={likesTotalPages} onPageChange={setLikesPage} />
                  </>
                )}
              </div>
            </div>
          ) : null}

          {selectedTab === "leaders" ? (
            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--black)]">Industry Leaders Speak</h3>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">
                    Update homepage leader cards (image, name, designation, and message).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={saveIndustryLeaders}
                  disabled={isPending}
                  className="rounded-xl bg-[var(--black)] px-4 py-2.5 text-sm font-medium text-white"
                >
                  {isPending ? "Saving..." : "Save Leaders"}
                </button>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {industryLeaders.map((leader) => (
                  <div key={leader.role} className="rounded-2xl border border-[var(--lightgray)] bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-[var(--darkgray)]">
                      {leader.role === "president"
                        ? "President"
                        : leader.role === "secretary"
                          ? "Secretary"
                          : "Top Performer"}
                    </p>

                    <label className="mt-3 block">
                      <span className="mb-1 block text-sm font-medium text-[var(--black)]">Current Image</span>
                      <img
                        src={leader.imageUrl}
                        alt={leader.name || leader.role}
                        className="h-36 w-full rounded-xl border border-[var(--lightgray)] object-cover"
                      />
                    </label>

                    <label className="mt-3 block">
                      <span className="mb-1 block text-sm font-medium text-[var(--black)]">Choose New Image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) =>
                          updateIndustryLeaderImage(leader.role, event.target.files?.[0] ?? null)
                        }
                        className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                      />
                      {leader.imageFile ? (
                        <p className="mt-1 text-xs text-[var(--darkgray)]">Selected: {leader.imageFile.name}</p>
                      ) : (
                        <p className="mt-1 text-xs text-[var(--darkgray)]">No new file selected.</p>
                      )}
                    </label>

                    <label className="mt-3 block">
                      <span className="mb-1 block text-sm font-medium text-[var(--black)]">Name</span>
                      <input
                        value={leader.name}
                        onChange={(event) =>
                          updateIndustryLeaderField(leader.role, "name", event.target.value)
                        }
                        className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                      />
                    </label>

                    <label className="mt-3 block">
                      <span className="mb-1 block text-sm font-medium text-[var(--black)]">Designation</span>
                      <input
                        value={leader.designation}
                        onChange={(event) =>
                          updateIndustryLeaderField(leader.role, "designation", event.target.value)
                        }
                        className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                      />
                    </label>

                    <label className="mt-3 block">
                      <span className="mb-1 block text-sm font-medium text-[var(--black)]">Message</span>
                      <textarea
                        rows={4}
                        value={leader.message}
                        onChange={(event) =>
                          updateIndustryLeaderField(leader.role, "message", event.target.value)
                        }
                        className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {selectedTab === "products" ? (
            <div className="rounded-[28px] border border-white/75 bg-white/92 p-6 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[var(--black)]">All Products</h3>
                  <p className="mt-1 text-sm text-[var(--darkgray)]">
                    Review all vendor gallery images, hide or unhide them, and remove invalid listings.
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
                    placeholder="Search category, image name, or vendor"
                    className="w-full rounded-2xl border border-[var(--lightgray)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--black)] outline-none transition focus:border-[var(--primary)]"
                  />
                </label>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-[var(--darkgray)]">
                      <th className="px-4 py-2 font-medium">Image Name</th>
                      <th className="px-4 py-2 font-medium">Category</th>
                      <th className="px-4 py-2 font-medium">Vendor Name</th>
                      <th className="px-4 py-2 font-medium">Product Image</th>
                      <th className="px-4 py-2 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="bg-[var(--secondary)]/35">
                        <td className="rounded-l-2xl px-4 py-4">
                          <p className="font-semibold text-[var(--black)]">{product.imageName}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{product.category}</td>
                        <td className="px-4 py-4 text-sm text-[var(--black)]">{product.vendor}</td>
                        <td className="px-4 py-4">
                          <img
                            src={product.image}
                            alt={product.imageName}
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
                  Mobile is read-only. You can update all other vendor fields.
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
                  <option>Locked</option>
                  <option>Pending</option>
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
              <div className="rounded-xl border border-[var(--lightgray)] bg-[var(--secondary)] px-3 py-2.5 md:col-span-2">
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Catalogue Analytics</span>
                <div className="grid gap-2 text-sm text-[var(--darkgray)] md:grid-cols-2">
                  <p><span className="font-medium text-[var(--black)]">Slug:</span> {editingVendor.catalogueSlug}</p>
                  <p><span className="font-medium text-[var(--black)]">Shares:</span> {editingVendor.catalogueShares}</p>
                  <p><span className="font-medium text-[var(--black)]">Views:</span> {editingVendor.catalogueViews}</p>
                  <p><span className="font-medium text-[var(--black)]">Last Shared:</span> {editingVendor.lastSharedAt}</p>
                  <p><span className="font-medium text-[var(--black)]">Last Viewed:</span> {editingVendor.lastViewedAt}</p>
                </div>
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
                <span className="mb-1 block text-sm font-medium text-[var(--black)]">Date of Birth</span>
                <input
                  type="date"
                  value={editingVendor.dob}
                  max={maxDobValue}
                  onChange={(event) => updateVendorField("dob", event.target.value)}
                  className="w-full rounded-xl border border-[var(--lightgray)] px-3 py-2.5 text-sm text-[var(--black)] outline-none focus:border-[var(--primary)]"
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
                  Image: <span className="font-medium text-[var(--black)]">{deletingProduct.imageName}</span>
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
