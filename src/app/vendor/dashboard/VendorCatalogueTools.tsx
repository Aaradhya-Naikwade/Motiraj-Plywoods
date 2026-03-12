"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Copy, ExternalLink, Loader2, Share2, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

type VendorCatalogueToolsProps = {
  cataloguePath: string;
  companyName: string;
  hasProducts: boolean;
  onTrackShareAction: () => Promise<{ ok: boolean }>;
};

export default function VendorCatalogueTools({
  cataloguePath,
  companyName,
  hasProducts,
  onTrackShareAction,
}: VendorCatalogueToolsProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const catalogueUrl = useMemo(() => {
    if (!origin) {
      return cataloguePath;
    }
    return new URL(cataloguePath, origin).toString();
  }, [cataloguePath, origin]);

  function trackAndRun(callback: () => void | Promise<void>) {
    startTransition(async () => {
      const result = await onTrackShareAction();
      if (!result.ok) {
        toast.error("Unable to track catalogue share right now.");
        return;
      }
      await callback();
    });
  }

  function copyLink() {
    trackAndRun(async () => {
      try {
        await navigator.clipboard.writeText(catalogueUrl);
        setIsOpen(false);
        toast.success("Catalogue link copied.");
      } catch {
        toast.error("Unable to copy the catalogue link.");
      }
    });
  }

  function shareOnWhatsapp() {
    trackAndRun(() => {
      const message = encodeURIComponent(`Hello, this is ${companyName}. View our catalogue here: ${catalogueUrl}`);
      setIsOpen(false);
      window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen ? (
        <div className="mb-3 w-[220px] rounded-2xl border border-[#dfd6cb] bg-white p-3 shadow-[0_20px_50px_-25px_rgba(41,24,8,0.42)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--black)]">Share Catalogue</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--lightgray)] text-[var(--black)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={copyLink}
              disabled={isPending}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Copy size={16} />}
              Copy Link
            </button>
            <button
              type="button"
              onClick={shareOnWhatsapp}
              disabled={isPending}
              className="flex w-full items-center gap-2 rounded-xl border border-[#bfe2cd] bg-[#eaf8ef] px-3 py-2.5 text-sm font-medium text-[#1b6c3d] transition hover:bg-[#def3e6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <FaWhatsapp size={16} />}
              WhatsApp Share
            </button>
            <a
              href={catalogueUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl border border-[var(--lightgray)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]"
            >
              <ExternalLink size={16} />
              Open Catalogue
            </a>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (!hasProducts) {
            toast.error("First add your products.");
            return;
          }
          setIsOpen((current) => !current);
        }}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(73,36,10,0.6)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
        Share Catalogue
      </button>
    </div>
  );
}
