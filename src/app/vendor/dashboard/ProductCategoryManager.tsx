"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  rectIntersection,
} from "@dnd-kit/core";
import { CheckCircle2, Grip, ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
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

type DroppableZoneId = "unassigned" | `category:${VendorProductCategoryKey}`;

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
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleDropToCategory = (event: React.DragEvent<HTMLDivElement>, categoryKey: VendorProductCategoryKey | null) => {
    event.preventDefault();
    event.stopPropagation();

    if (isSubmitting) {
      return;
    }

    const hasFiles =
      event.dataTransfer?.types?.includes?.("Files") &&
      (event.dataTransfer.files?.length ?? 0) > 0;
    if (!hasFiles) {
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 12 } })
  );

  const getCategoryKeyFromZone = (zoneId: DroppableZoneId | null) => {
    if (!zoneId) {
      return null;
    }
    if (zoneId === "unassigned") {
      return null;
    }
    if (zoneId.startsWith("category:")) {
      return zoneId.replace("category:", "") as VendorProductCategoryKey;
    }
    return null;
  };

  const activeImage = activeId
    ? pendingImages.find((image) => image.key === activeId) ?? null
    : null;

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

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            autoScroll
            onDragStart={({ active }) => {
              setActiveId(String(active.id));
              setDraggedKey(String(active.id));
            }}
            onDragEnd={({ active, over }) => {
              if (!over) {
                setActiveId(null);
                setDraggedKey(null);
                return;
              }
              const activeKey = String(active.id);
              const nextZone = String(over.id) as DroppableZoneId;
              const nextCategory = getCategoryKeyFromZone(nextZone);
              assignCategory(activeKey, nextCategory);
              setActiveId(null);
              setDraggedKey(null);
            }}
            onDragCancel={() => {
              setActiveId(null);
              setDraggedKey(null);
            }}
          >
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const hasFiles =
                  event.dataTransfer?.types?.includes?.("Files") &&
                  (event.dataTransfer.files?.length ?? 0) > 0;
                if (!hasFiles) {
                  return;
                }
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

              <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] min-w-0">
                <DroppableZone
                  id="unassigned"
                  onDrop={(event) => handleDropToCategory(event, null)}
                  className="rounded-[20px] border border-[#e6ddd2] bg-white p-4 xl:flex xl:flex-col min-w-0"
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

                  <div className="scrollbar-hidden mt-3 min-h-[160px] w-full max-w-full overflow-hidden rounded-[16px] bg-[#f9f5ef] p-2 sm:min-h-[260px] sm:p-3 xl:flex-1 xl:overflow-y-auto">
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
                      <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-2 pr-2 touch-pan-x">
                        {pendingImages
                          .filter((image) => image.categoryKey === null)
                          .map((image) => (
                            <DraggableImageCard
                              key={image.key}
                              image={image}
                              isSubmitting={isSubmitting}
                              isDragging={draggedKey === image.key}
                              onRemove={() => removePendingImage(image.key)}
                              containerClassName="min-w-[120px] flex-shrink-0 sm:min-w-0 sm:flex-shrink"
                              imageClassName="h-20 sm:h-24"
                            />
                          ))}
                      </div>
                    )}
                  </div>
                </DroppableZone>

                <div className="rounded-[24px] border border-[#e6ddd2] bg-white p-4 xl:flex xl:flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[var(--black)]">Category Boxes</h3>
                      <p className="mt-1 text-xs text-[var(--darkgray)]">Drop each image into one category.</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 xl:grid-cols-2">
                    {VENDOR_PRODUCT_CATEGORIES.map((category) => {
                      const categoryImages = pendingImages.filter((image) => image.categoryKey === category.key);
                      const zoneId = `category:${category.key}` as DroppableZoneId;
                      return (
                        <DroppableZone
                          key={category.key}
                          id={zoneId}
                          onDrop={(event) => handleDropToCategory(event, category.key)}
                          className={`rounded-[16px] border p-2 sm:rounded-[18px] sm:p-3 transition ${
                            categoryImages.length > 0
                              ? "border-[#d8ccb9] bg-[#f7f1e8]"
                              : "border-[#ece3d8] bg-[#fcfaf7]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-[11px] font-semibold text-[var(--black)] sm:text-sm">{category.label}</h4>
                              {categoryImages.length > 0 ? (
                                <p className="mt-0.5 text-[10px] text-[var(--darkgray)]">Assigned images</p>
                              ) : null}
                            </div>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--black)] shadow-sm">
                              {categoryImages.length}
                            </span>
                          </div>

                          {categoryImages.length === 0 ? (
                            <p className="mt-2 text-[10px] text-[var(--darkgray)]">Drop images here</p>
                          ) : (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 pr-1 touch-pan-x sm:grid sm:grid-cols-2">
                              {categoryImages.map((image) => (
                                <DraggableImageCard
                                  key={image.key}
                                  image={image}
                                  isSubmitting={isSubmitting}
                                  isDragging={draggedKey === image.key}
                                  onRemove={() => removePendingImage(image.key)}
                                  onMoveBack={() => assignCategory(image.key, null)}
                                  containerClassName="min-w-[120px] sm:min-w-0"
                                  imageClassName="h-16"
                                />
                              ))}
                            </div>
                          )}
                        </DroppableZone>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <DragOverlay>
              {activeImage ? (
                <div className="w-36 rounded-2xl border border-[#e6ddd2] bg-white p-2 shadow-xl">
                  <div className="relative overflow-hidden rounded-xl">
                    <Image
                      src={activeImage.previewUrl}
                      alt={activeImage.file.name}
                      width={240}
                      height={180}
                      className="h-20 w-full rounded-xl object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="truncate text-[10px] font-medium text-[var(--black)]">{activeImage.file.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f7efe6] px-2 py-1 text-[10px] font-semibold text-[var(--primary)]">
                      <Grip size={10} />
                      Drag
                    </span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

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
                className="mt-4 hidden w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex sm:w-auto"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSubmitting ? "Uploading Images..." : "Save Categorized Images"}
              </button>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#eadfd2] bg-white/95 px-4 py-3 shadow-[0_-10px_24px_-18px_rgba(0,0,0,0.35)] backdrop-blur sm:hidden">
            <div className="mx-auto flex max-w-5xl justify-center">
              <button
                type="submit"
                disabled={isSubmitting || pendingImages.length === 0 || unassignedCount > 0}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-16px_rgba(73,36,10,0.6)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSubmitting ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

type DroppableZoneProps = {
  id: DroppableZoneId;
  className: string;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  children: ReactNode;
};

function DroppableZone({ id, className, onDrop, children }: DroppableZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      className={`${className} ${isOver ? "ring-2 ring-[var(--primary)]/50" : ""}`}
    >
      {children}
    </div>
  );
}

type DraggableImageCardProps = {
  image: PendingImage;
  isSubmitting: boolean;
  isDragging: boolean;
  onRemove: () => void;
  onMoveBack?: () => void;
  containerClassName?: string;
  imageClassName?: string;
};

function DraggableImageCard({
  image,
  isSubmitting,
  isDragging,
  onRemove,
  onMoveBack,
  containerClassName,
  imageClassName,
}: DraggableImageCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: image.key });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-2xl border p-2 shadow-sm transition ${containerClassName ?? ""} ${
        isDragging
          ? "border-[var(--primary)] bg-[#f7efe6] opacity-30"
          : "border-[#e6ddd2] bg-[#faf8f4]"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="relative overflow-hidden rounded-xl">
        <Image
          src={image.previewUrl}
          alt={image.file.name}
          width={320}
          height={220}
          className={`w-full rounded-xl object-cover ${imageClassName ?? "h-24"}`}
          unoptimized
          draggable={false}
        />
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onRemove}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="mt-2 h-2" aria-hidden="true" />
      {onMoveBack ? (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onMoveBack}
          className="mt-2 text-[10px] font-medium text-[var(--primary)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Move back
        </button>
      ) : null}
    </div>
  );
}
