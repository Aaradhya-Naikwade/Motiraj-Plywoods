"use client";

import { Toaster } from "sonner";
import { AlertCircle, CheckCircle2, Info, Loader2, TriangleAlert, X } from "lucide-react";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      visibleToasts={4}
      icons={{
        success: <CheckCircle2 size={18} />,
        error: <AlertCircle size={18} />,
        info: <Info size={18} />,
        warning: <TriangleAlert size={18} />,
        loading: <Loader2 size={18} className="animate-spin" />,
        close: <X size={16} />,
      }}
      toastOptions={{
        className:
          "group rounded-2xl border border-[#e9dfd2] bg-white/95 text-[#2e2a26] shadow-[0_12px_28px_rgba(18,12,6,0.14)] backdrop-blur-sm",
        descriptionClassName: "text-[#6b5f52]",
        classNames: {
          toast: "px-4 py-3",
          title: "text-sm font-semibold tracking-tight",
          description: "mt-1 text-xs leading-relaxed",
          closeButton:
            "border border-[#dfd3c4] bg-white text-[#7b6d5d] hover:bg-[#f8f2ea] hover:text-[#2e2a26] transition",
          actionButton:
            "bg-[var(--primary)] text-white hover:opacity-90 rounded-lg px-3 py-1.5 text-xs font-semibold",
          cancelButton:
            "border border-[#dfd3c4] bg-white text-[#2e2a26] hover:bg-[#f8f2ea] rounded-lg px-3 py-1.5 text-xs font-semibold",
          success: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
          error: "border-red-200 bg-red-50/95 text-red-900",
          info: "border-sky-200 bg-sky-50/95 text-sky-900",
          warning: "border-amber-200 bg-amber-50/95 text-amber-900",
        },
        style: {
          borderRadius: "16px",
        },
      }}
    />
  );
}
