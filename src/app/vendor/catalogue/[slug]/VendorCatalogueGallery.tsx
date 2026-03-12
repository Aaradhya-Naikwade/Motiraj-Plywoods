"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

type CatalogueImage = {
  id: string;
  imageUrl: string;
  category: string;
  likeCount: number;
  initiallyLiked: boolean;
};

type CatalogueGroup = {
  category: string;
  items: CatalogueImage[];
};

type VendorCatalogueGalleryProps = {
  groups: CatalogueGroup[];
};

export default function VendorCatalogueGallery({
  groups,
}: VendorCatalogueGalleryProps) {
  const [likedState, setLikedState] = useState(
    groups.reduce<Record<string, { liked: boolean; count: number }>>((acc, group) => {
      for (const item of group.items) {
        acc[item.id] = { liked: item.initiallyLiked, count: item.likeCount };
      }
      return acc;
    }, {})
  );
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  async function toggleLike(productId: string) {
    if (pendingProductId) {
      return;
    }

    const current = likedState[productId];
    if (!current) {
      return;
    }

    setPendingProductId(productId);
    setLikedState((state) => ({
      ...state,
      [productId]: {
        liked: !current.liked,
        count: current.count + (current.liked ? -1 : 1),
      },
    }));

    try {
      const response = await fetch("/api/vendor-catalogue/likes/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      const result = (await response.json()) as { ok: boolean; liked?: boolean; count?: number; error?: string };
      if (!response.ok || !result.ok || typeof result.liked !== "boolean" || typeof result.count !== "number") {
        throw new Error(result.error || "Unable to update like.");
      }

      setLikedState((state) => ({
        ...state,
        [productId]: {
          liked: result.liked!,
          count: result.count!,
        },
      }));
    } catch {
      setLikedState((state) => ({
        ...state,
        [productId]: current,
      }));
      toast.error("Unable to update like right now.");
    } finally {
      setPendingProductId(null);
    }
  }

  return (
    <div className="space-y-10">
        {groups.map((group) => (
          <div
            key={group.category}
            className="rounded-[30px] border border-[#e6d8c6] bg-white p-5 shadow-[0_22px_70px_-48px_rgba(67,38,6,0.38)] md:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-[#201710]">{group.category}</h2>
                <p className="mt-1 text-sm text-[#6b5f52]">
                  {group.items.length} image{group.items.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {group.items.map((product) => {
                const likeState = likedState[product.id];
                const isPending = pendingProductId === product.id;

                return (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-[28px] border border-[#efe5d8] bg-[#fffdf9] shadow-[0_24px_60px_-44px_rgba(67,38,6,0.38)]"
                  >
                    <div className="relative">
                      <Image
                        src={product.imageUrl || "/image/plywood.png"}
                        alt={group.category}
                        width={520}
                        height={380}
                        className="h-72 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => toggleLike(product.id)}
                        disabled={isPending}
                        aria-pressed={likeState?.liked}
                        className={`absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-lg transition ${
                          likeState?.liked
                            ? "border-[#b4234d] bg-[#b4234d] text-white"
                            : "border-white/80 bg-white/95 text-[#201710] hover:bg-white"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <Heart size={16} className={likeState?.liked ? "fill-current" : ""} />
                        {likeState?.count ?? 0}
                      </button>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-70 transition group-hover:opacity-90" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
