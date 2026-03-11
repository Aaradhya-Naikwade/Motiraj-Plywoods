"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import {
  VENDOR_PRODUCT_ALLOWED_MIME_TYPES,
  VENDOR_PRODUCT_BATCH_MAX_FILES,
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
      }

      syncInputFiles(next.map((image) => image.file));
      return next;
    });
  };

  const removePendingImage = (key: string) => {
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
    setPendingImages((current) =>
      current.map((image) => (image.key === key ? { ...image, categoryKey } : image))
    );
  };

  const handleDropToCategory = (event: React.DragEvent<HTMLDivElement>, categoryKey: VendorProductCategoryKey | null) => {
    event.preventDefault();
    event.stopPropagation();

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

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#d8d0c6] bg-[#f6f3ee] p-5 shadow-xl md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[var(--black)]">Upload Category Gallery</h2>
            <p className="mt-1 text-sm text-[var(--darkgray)]">
              Select multiple images, preview them instantly, then drag each one into the correct category box.
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            <ImagePlus size={16} />
            Choose Images
          </button>
        </div>

        <form
          action={saveAction}
          className="mt-5 space-y-5"
          onSubmit={(event) => {
            if (pendingImages.length === 0) {
              event.preventDefault();
              toast.error("Select at least one image before saving.");
              return;
            }

            if (unassignedCount > 0) {
              event.preventDefault();
              toast.error("Assign every image to a category before saving.");
            }
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
            className="rounded-[24px] border border-[#d2c9be] bg-[#efe9e1] p-4 md:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--black)]">Drag and Drop Workspace</p>
                <p className="mt-1 text-xs text-[var(--darkgray)]">
                  Keep unassigned images on the left and drop them into category boxes on the right.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="rounded-full bg-white px-3 py-1 text-[var(--black)] shadow-sm">
                  {pendingImages.length} selected
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[var(--black)] shadow-sm">
                  {assignedCount} assigned
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[var(--black)] shadow-sm">
                  {unassignedCount} unassigned
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:max-h-[calc(100vh-260px)] xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)]">
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDropToCategory(event, null)}
                className="rounded-[24px] border border-[#d7cfc4] bg-[#fbfaf7] p-4 xl:flex xl:max-h-[calc(100vh-260px)] xl:flex-col"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--black)]">Selected Images</h3>
                    <p className="mt-1 text-xs text-[var(--darkgray)]">Unassigned images stay here until dropped into a category.</p>
                  </div>
                  <span className="rounded-full bg-[#ede6db] px-3 py-1 text-xs font-semibold text-[var(--black)]">
                    {unassignedCount}
                  </span>
                </div>

                <div className="mt-4 min-h-[320px] rounded-[20px] border border-[#ddd4c9] bg-[#ffffff] p-3 xl:flex-1 xl:overflow-y-auto">
                  {pendingImages.length === 0 ? (
                    <div className="flex min-h-[284px] flex-col items-center justify-center gap-2 text-center text-[var(--darkgray)]">
                      <UploadCloud size={28} />
                      <p className="text-sm font-medium">No images selected yet</p>
                      <p className="text-xs">Choose multiple files and they will appear here instantly.</p>
                    </div>
                  ) : pendingImages.filter((image) => image.categoryKey === null).length === 0 ? (
                    <div className="flex min-h-[284px] items-center justify-center rounded-2xl border border-dashed border-[#d9d0c4] text-center text-sm text-[var(--darkgray)]">
                      All selected images are assigned. Drop any image here to unassign it.
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {pendingImages
                        .filter((image) => image.categoryKey === null)
                        .map((image) => (
                          <div
                            key={image.key}
                            draggable
                            onDragStart={(event) => {
                              setDraggedKey(image.key);
                              event.dataTransfer.setData(INTERNAL_DRAG_KEY, image.key);
                              event.dataTransfer.effectAllowed = "move";
                            }}
                            onDragEnd={() => setDraggedKey(null)}
                            className="group rounded-2xl border border-[#ddd4c9] bg-[#faf8f4] p-2 shadow-sm"
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
                              <button
                                type="button"
                                onClick={() => removePendingImage(image.key)}
                                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            <p className="mt-2 truncate text-xs font-medium text-[var(--black)]">{image.file.name}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#d7cfc4] bg-[#f9f6f1] p-4 xl:flex xl:max-h-[calc(100vh-260px)] xl:flex-col">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--black)]">Category Boxes</h3>
                    <p className="mt-1 text-xs text-[var(--darkgray)]">Drop each image into exactly one category.</p>
                  </div>
                  <span className="rounded-full bg-[#ede6db] px-3 py-1 text-xs font-semibold text-[var(--black)]">
                    {assignedCount} assigned
                  </span>
                </div>

                <div className="mt-4 grid gap-2 xl:flex-1 xl:grid-cols-1 xl:overflow-y-auto xl:pr-1">
                  {VENDOR_PRODUCT_CATEGORIES.map((category) => {
                    const categoryImages = pendingImages.filter((image) => image.categoryKey === category.key);
                    return (
                      <div
                        key={category.key}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => handleDropToCategory(event, category.key)}
                        className="rounded-[20px] border border-[#d7cfc4] bg-[#eee7de] p-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--black)]">{category.label}</h4>
                            <p className="mt-0.5 text-[10px] text-[var(--darkgray)]">Drop images here</p>
                          </div>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[var(--black)] shadow-sm">
                            {categoryImages.length}
                          </span>
                        </div>

                        <div className="mt-2 min-h-[90px] rounded-[16px] border border-[#ddd4c9] bg-[#ffffff] p-2">
                          {categoryImages.length === 0 ? (
                            <div className="flex min-h-[74px] items-center justify-center rounded-2xl border border-dashed border-[#d9d0c4] px-2 text-center text-[10px] text-[var(--darkgray)]">
                              {category.label}
                            </div>
                          ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                              {categoryImages.map((image) => (
                                <div
                                  key={image.key}
                                  draggable
                                  onDragStart={(event) => {
                                    setDraggedKey(image.key);
                                    event.dataTransfer.setData(INTERNAL_DRAG_KEY, image.key);
                                    event.dataTransfer.effectAllowed = "move";
                                  }}
                                  onDragEnd={() => setDraggedKey(null)}
                                  className="rounded-2xl border border-[#ddd4c9] bg-[#faf8f4] p-2 shadow-sm"
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
                                    <button
                                      type="button"
                                      onClick={() => removePendingImage(image.key)}
                                      className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                  <p className="mt-1.5 truncate text-[11px] font-medium text-[var(--black)]">{image.file.name}</p>
                                  <button
                                    type="button"
                                    onClick={() => assignCategory(image.key, null)}
                                    className="mt-1 text-[10px] font-medium text-[var(--primary)] transition hover:opacity-80"
                                  >
                                    Move back
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d7cfc4] bg-[#f3eee7] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--black)]">Ready to save</p>
              <p className="mt-1 text-xs text-[var(--darkgray)]">
                Once saved, your categorized images will appear on the public vendor page.
              </p>
            </div>
            <button
              type="submit"
              disabled={pendingImages.length === 0 || unassignedCount > 0}
              className="inline-flex items-center justify-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save Categorized Images
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
