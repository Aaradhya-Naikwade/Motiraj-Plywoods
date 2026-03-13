"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Grip, ImagePlus, Loader2, MousePointerClick, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  VENDOR_PRODUCT_ALLOWED_MIME_TYPES,
  VENDOR_PRODUCT_BATCH_MAX_FILES,
  VENDOR_PRODUCT_BATCH_MAX_TOTAL_BYTES,
  VENDOR_PRODUCT_CATEGORIES,
  VENDOR_PRODUCT_IMAGE_MAX_SIZE_BYTES,
  type VendorProductCategoryKey,
} from "@/lib/vendor-product-categories";

type ProductCategoryManagerProps = {
  saveAction: (formData: FormData) => void | Promise<void>;
};

type PendingImage = {
  key: string;
  file: File;
  previewUrl: string;
  categoryKey: VendorProductCategoryKey | null;
};

const INTERNAL_DRAG_KEY = "application/x-vendor-image-key";

function makeFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function bytesToMb(value: number) {
  return (value / (1024 * 1024)).toFixed(1);
}

export default function ProductCategoryManager({ saveAction }: ProductCategoryManagerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingImagesRef = useRef<PendingImage[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<VendorProductCategoryKey | "">("");
  const longPressTimerRef = useRef<number | null>(null);

  const syncInputFiles = (files: File[]) => {
    if (!inputRef.current) {
      return;
    }

    const dataTransfer = new DataTransfer();
    for (const file of files) {
      dataTransfer.items.add(file);
    }
    inputRef.current.files = dataTransfer.files;
  };

  const addFiles = (incomingFiles: File[]) => {
    if (isSubmitting) {
      return;
    }

    if (incomingFiles.length === 0) {
      return;
    }

    setPendingImages((current) => {
      const next = [...current];
      const knownKeys = new Set(current.map((image) => image.key));

      for (const file of incomingFiles) {
        if (!VENDOR_PRODUCT_ALLOWED_MIME_TYPES.includes(file.type as (typeof VENDOR_PRODUCT_ALLOWED_MIME_TYPES)[number])) {
          toast.error("Only JPG, PNG, and WEBP images are allowed.");
          continue;
        }

        if (file.size > VENDOR_PRODUCT_IMAGE_MAX_SIZE_BYTES) {
          toast.error(`Each image must be ${bytesToMb(VENDOR_PRODUCT_IMAGE_MAX_SIZE_BYTES)} MB or smaller.`);
          continue;
        }

        const key = makeFileKey(file);
        if (knownKeys.has(key)) {
          continue;
        }
        
        if (next.length >= VENDOR_PRODUCT_BATCH_MAX_FILES) {
          toast.error(`You can add up to ${VENDOR_PRODUCT_BATCH_MAX_FILES} images in one batch.`);
          break;
        }

        knownKeys.add(key);
        next.push({
          key,
          file,
          previewUrl: URL.createObjectURL(file),
          categoryKey: null,
        });

        const totalBytes = next.reduce((sum, image) => sum + image.file.size, 0);
        if (totalBytes > VENDOR_PRODUCT_BATCH_MAX_TOTAL_BYTES) {
          URL.revokeObjectURL(next[next.length - 1].previewUrl);
          next.pop();
          knownKeys.delete(key);
          toast.error(`Total upload size must stay under ${bytesToMb(VENDOR_PRODUCT_BATCH_MAX_TOTAL_BYTES)} MB.`);
          break;
        }
      }

      syncInputFiles(next.map((image) => image.file));
      return next;
    });
  };

  const removePendingImage = (key: string) => {
    if (isSubmitting) {
      return;
    }

    setPendingImages((current) => {
      const target = current.find((image) => image.key === key);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      const next = current.filter((image) => image.key !== key);
      syncInputFiles(next.map((image) => image.file));
      return next;
    });
  };

  const assignCategory = (key: string, categoryKey: VendorProductCategoryKey | null) => {
    if (isSubmitting) {
      return;
    }

    setPendingImages((current) =>
      current.map((image) => (image.key === key ? { ...image, categoryKey } : image))
    );
  };

  const assignCategoryBulk = (keys: string[], categoryKey: VendorProductCategoryKey | null) => {
    if (isSubmitting || keys.length === 0) {
      return;
    }

    const keySet = new Set(keys);
    setPendingImages((current) =>
      current.map((image) => (keySet.has(image.key) ? { ...image, categoryKey } : image))
    );
  };

  const toggleSelectedKey = (key: string) => {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedKeys(new Set());
  };

  const handleDropToCategory = (event: React.DragEvent<HTMLDivElement>, categoryKey: VendorProductCategoryKey | null) => {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) {
      return;
    }

    const internalKey = event.dataTransfer.getData(INTERNAL_DRAG_KEY);
    if (internalKey) {
      assignCategory(internalKey, categoryKey);
      setDraggedKey(null);
      return;
    }

    const droppedFiles = Array.from(event.dataTransfer.files ?? []);
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  useEffect(() => {
    pendingImagesRef.current = pendingImages;
  }, [pendingImages]);

  useEffect(() => {
    setIsTouch(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || window.matchMedia?.("(pointer: coarse)").matches)
    );
    return () => {
      pendingImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const assignmentsValue = useMemo(
    () =>
      JSON.stringify(
        pendingImages
          .map((image, index) => (image.categoryKey ? { index, categoryKey: image.categoryKey } : null))
          .filter((entry) => entry !== null)
      ),
    [pendingImages]
  );

  const unassignedCount = pendingImages.filter((image) => !image.categoryKey).length;
  const assignedCount = pendingImages.length - unassignedCount;
  const totalBatchSizeBytes = pendingImages.reduce((sum, image) => sum + image.file.size, 0);
  const selectedCount = selectedKeys.size;
  const canAssignSelected = selectedCount > 0 && selectedCategory !== "";

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-white/80 bg-white/95 p-4 shadow-[0_24px_70px_-40px_rgba(73,36,10,0.42)] md:p-6">
        <form
          action={saveAction}
          className="space-y-5"
          onSubmit={(event) => {
            if (pendingImages.length === 0) {
              event.preventDefault();
              toast.error("Select at least one image before saving.");
              setIsSubmitting(false);
              return;
            }

            if (unassignedCount > 0) {
              event.preventDefault();
              toast.error("Assign every image to a category before saving.");
              setIsSubmitting(false);
              return;
            }

            if (totalBatchSizeBytes > VENDOR_PRODUCT_BATCH_MAX_TOTAL_BYTES) {
              event.preventDefault();
              toast.error(`Total upload size must stay under ${bytesToMb(VENDOR_PRODUCT_BATCH_MAX_TOTAL_BYTES)} MB.`);
              setIsSubmitting(false);
              return;
            }

            setIsSubmitting(true);
          }}
        >
          <input
            ref={inputRef}
            name="images"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
          />
          <input type="hidden" name="assignments" value={assignmentsValue} />

          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              addFiles(Array.from(event.dataTransfer.files ?? []));
            }}
            className={`relative ${isSubmitting ? "pointer-events-none" : ""}`}
          >
            {isSubmitting ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-[#f6f3ee]/90 backdrop-blur-[2px]">
                <div className="flex min-w-[260px] items-center gap-4 rounded-2xl border border-[#d7cfc4] bg-white px-5 py-4 shadow-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#efe9e1] text-[var(--primary)]">
                    <Loader2 size={22} className="animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--black)]">Uploading your gallery</p>
                    <p className="mt-1 text-xs text-[var(--darkgray)]">Please wait while images are being saved.</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)]">
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDropToCategory(event, null)}
                className="rounded-[20px] border border-[#e6ddd2] bg-white p-4 xl:flex xl:flex-col"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--black)]">Selected Images</h3>
                    <p className="mt-1 text-xs text-[var(--darkgray)]">Unassigned images stay here.</p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#eadfd2] bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--black)]">
                        Selected {pendingImages.length}
                      </span>
                      <span className="hidden rounded-full border border-[#eadfd2] bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--black)] sm:inline-flex">
                        Assigned {assignedCount}
                      </span>
                      <span className="hidden rounded-full border border-[#eadfd2] bg-white px-2.5 py-1 text-[10px] font-semibold text-[var(--black)] sm:inline-flex">
                        Unassigned {unassignedCount}
                      </span>
                    </div>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                      {isSubmitting ? "Uploading..." : "Choose Images"}
                    </button>
                  </div>
                </div>

                <div className="scrollbar-hidden mt-3 min-h-[260px] rounded-[16px] bg-[#f9f5ef] p-3 xl:flex-1 xl:overflow-y-auto">
                  {pendingImages.length === 0 ? (
                    <div className="flex min-h-[224px] flex-col items-center justify-center gap-2 text-center text-[var(--darkgray)]">
                      <UploadCloud size={28} />
                      <p className="text-sm font-medium">No images selected</p>
                      <p className="text-xs">Choose multiple files to start.</p>
                    </div>
                  ) : pendingImages.filter((image) => image.categoryKey === null).length === 0 ? (
                    <div className="flex min-h-[224px] items-center justify-center rounded-2xl border border-dashed border-[#d9d0c4] text-center text-sm text-[var(--darkgray)]">
                      All selected images are assigned. Drop any image here to unassign it.
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {pendingImages
                        .filter((image) => image.categoryKey === null)
                        .map((image) => (
                          <div
                            key={image.key}
                            draggable={!isSubmitting && !isTouch}
                            onPointerDown={(event) => {
                              if (!isTouch || isSubmitting) {
                                return;
                              }
                              if (longPressTimerRef.current) {
                                window.clearTimeout(longPressTimerRef.current);
                              }
                              longPressTimerRef.current = window.setTimeout(() => {
                                setIsMultiSelect(true);
                                toggleSelectedKey(image.key);
                              }, 450);
                            }}
                            onPointerUp={() => {
                              if (!isTouch) {
                                return;
                              }
                              if (longPressTimerRef.current) {
                                window.clearTimeout(longPressTimerRef.current);
                                longPressTimerRef.current = null;
                              }
                            }}
                            onPointerLeave={() => {
                              if (!isTouch) {
                                return;
                              }
                              if (longPressTimerRef.current) {
                                window.clearTimeout(longPressTimerRef.current);
                                longPressTimerRef.current = null;
                              }
                            }}
                            onClick={() => {
                              if (isTouch && isMultiSelect) {
                                toggleSelectedKey(image.key);
                              }
                            }}
                            onDragStart={(event) => {
                              setDraggedKey(image.key);
                              event.dataTransfer.setData(INTERNAL_DRAG_KEY, image.key);
                              event.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => setDraggedKey(null)}
                            className={`group rounded-2xl border p-2 shadow-sm transition ${
                              draggedKey === image.key
                                ? "border-[var(--primary)] bg-[#f7efe6]"
                                : "border-[#e6ddd2] bg-[#faf8f4]"
                            }`}
                          >
                            <div className="relative overflow-hidden rounded-xl">
                              <Image
                                src={image.previewUrl}
                                alt={image.file.name}
                                width={320}
                                height={220}
                                className="h-24 w-full rounded-xl object-cover"
                                unoptimized
                              />
                              {isTouch && isMultiSelect ? (
                                <span className={`absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${selectedKeys.has(image.key) ? "bg-[var(--primary)] text-white" : "bg-white/90 text-[var(--black)]"}`}>
                                  {selectedKeys.has(image.key) ? "x" : ""}
                                </span>
                              ) : null}
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => removePendingImage(image.key)}
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <p className="truncate text-xs font-medium text-[var(--black)]">{image.file.name}</p>
                              <span className="hidden items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[var(--primary)] sm:inline-flex">
                                <Grip size={10} />
                                Drag
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#e6ddd2] bg-white p-4 xl:flex xl:flex-col">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--black)]">Category Boxes</h3>
                    <p className="mt-1 text-xs text-[var(--darkgray)]">Drop each image into one category.</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                  {VENDOR_PRODUCT_CATEGORIES.map((category) => {
                    const categoryImages = pendingImages.filter((image) => image.categoryKey === category.key);
                    return (
                      <div
                        key={category.key}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDropToCategory(event, category.key)}
                        className={`rounded-[18px] border p-3 transition ${
                          categoryImages.length > 0
                            ? "border-[#d8ccb9] bg-[#f7f1e8]"
                            : "border-[#ece3d8] bg-[#fcfaf7]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--black)]">{category.label}</h4>
                            {categoryImages.length > 0 ? (
                              <p className="mt-0.5 text-[10px] text-[var(--darkgray)]">Assigned images</p>
                            ) : null}
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--black)] shadow-sm">
                            {categoryImages.length}
                          </span>
                        </div>

                        {categoryImages.length === 0 ? (
                          <p className="mt-2 text-[10px] text-[var(--darkgray)]">Drop images here</p>
                        ) : (
                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {categoryImages.map((image) => (
                              <div
                              key={image.key}
                                draggable={!isSubmitting && !isTouch}
                                onPointerDown={() => {
                                  if (!isTouch || isSubmitting) {
                                    return;
                                  }
                                  if (longPressTimerRef.current) {
                                    window.clearTimeout(longPressTimerRef.current);
                                  }
                                  longPressTimerRef.current = window.setTimeout(() => {
                                    setIsMultiSelect(true);
                                    toggleSelectedKey(image.key);
                                  }, 450);
                                }}
                                onPointerUp={() => {
                                  if (!isTouch) {
                                    return;
                                  }
                                  if (longPressTimerRef.current) {
                                    window.clearTimeout(longPressTimerRef.current);
                                    longPressTimerRef.current = null;
                                  }
                                }}
                                onPointerLeave={() => {
                                  if (!isTouch) {
                                    return;
                                  }
                                  if (longPressTimerRef.current) {
                                    window.clearTimeout(longPressTimerRef.current);
                                    longPressTimerRef.current = null;
                                  }
                                }}
                                onClick={() => {
                                  if (isTouch && isMultiSelect) {
                                    toggleSelectedKey(image.key);
                                  }
                                }}
                                onDragStart={(event) => {
                                  setDraggedKey(image.key);
                                  event.dataTransfer.setData(INTERNAL_DRAG_KEY, image.key);
                                  event.dataTransfer.effectAllowed = "move";
                                }}
                                onDragEnd={() => setDraggedKey(null)}
                                className={`rounded-2xl border p-2 shadow-sm transition ${
                                  draggedKey === image.key
                                    ? "border-[var(--primary)] bg-[#f7efe6]"
                                    : "border-[#e6ddd2] bg-[#faf8f4]"
                                }`}
                              >
                                <div className="relative overflow-hidden rounded-xl">
                                  <Image
                                    src={image.previewUrl}
                                    alt={image.file.name}
                                    width={320}
                                    height={220}
                                    className="h-16 w-full rounded-xl object-cover"
                                    unoptimized
                                  />
                                  {isTouch && isMultiSelect ? (
                                    <span className={`absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${selectedKeys.has(image.key) ? "bg-[var(--primary)] text-white" : "bg-white/90 text-[var(--black)]"}`}>
                                      {selectedKeys.has(image.key) ? "x" : ""}
                                    </span>
                                  ) : null}
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => removePendingImage(image.key)}
                                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                                <div className="mt-1.5 flex items-center justify-between gap-2">
                                  <p className="truncate text-[11px] font-medium text-[var(--black)]">{image.file.name}</p>
                                  <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => assignCategory(image.key, null)}
                                    className="text-[10px] font-medium text-[var(--primary)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Move back
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#eadfd2] bg-white px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--black)]">Ready to save</p>
                <p className="mt-1 text-xs text-[var(--darkgray)]">Save when everything is assigned.</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#f7f1e8] px-3 py-1.5 text-xs font-semibold text-[var(--black)]">
                <CheckCircle2 size={14} className={unassignedCount === 0 && pendingImages.length > 0 ? "text-emerald-600" : "text-[var(--darkgray)]"} />
                {unassignedCount === 0 && pendingImages.length > 0 ? "All images assigned" : `${unassignedCount} image${unassignedCount === 1 ? "" : "s"} left`}
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting || pendingImages.length === 0 || unassignedCount > 0}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSubmitting ? "Uploading Images..." : "Save Categorized Images"}
              </button>
            </div>
          </div>

          {isTouch && isMultiSelect ? (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eadfd2] bg-white/95 px-4 py-3 shadow-[0_-12px_30px_-20px_rgba(0,0,0,0.4)] backdrop-blur">
              <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--black)]">
                  <span className="rounded-full border border-[#eadfd2] bg-white px-3 py-1">Selected {selectedCount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearSelection();
                      setIsMultiSelect(false);
                    }}
                    className="rounded-full border border-[#eadfd2] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--darkgray)]"
                  >
                    Done
                  </button>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-1 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value as VendorProductCategoryKey)}
                    className="w-full appearance-none rounded-full border border-[#e6ddd2] bg-white px-4 py-2 text-xs font-semibold text-[var(--black)] shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 sm:min-w-[180px] sm:w-auto"
                  >
                    <option value="">Move to category</option>
                    {VENDOR_PRODUCT_CATEGORIES.map((category) => (
                      <option key={category.key} value={category.key}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!canAssignSelected}
                    onClick={() => {
                      if (!canAssignSelected) return;
                      assignCategoryBulk(Array.from(selectedKeys), selectedCategory);
                      toast.success(`Assigned to ${VENDOR_PRODUCT_CATEGORIES.find((c) => c.key === selectedCategory)?.label ?? "category"}.`);
                      setSelectedCategory("");
                      clearSelection();
                      setIsMultiSelect(false);
                    }}
                    className="w-full rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    Assign
                  </button>
                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={() => {
                      if (selectedCount === 0) return;
                      assignCategoryBulk(Array.from(selectedKeys), null);
                      toast.success("Moved back to unassigned.");
                      clearSelection();
                      setIsMultiSelect(false);
                    }}
                    className="w-full rounded-full border border-[#eadfd2] bg-white px-4 py-2 text-xs font-semibold text-[var(--black)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    Move back
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

