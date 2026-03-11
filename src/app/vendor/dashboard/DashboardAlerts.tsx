"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type DashboardAlertsProps = {
  status?: string;
  error?: string;
};

export default function DashboardAlerts({ status, error }: DashboardAlertsProps) {
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) {
      return;
    }

    if (status === "profile_updated") {
      toast.success("Profile updated successfully.");
      shownRef.current = true;
      return;
    }

    if (status === "product_created") {
      toast.success("Images saved to categories successfully.");
      shownRef.current = true;
      return;
    }

    if (status === "product_deleted") {
      toast.success("Image deleted successfully.");
      shownRef.current = true;
      return;
    }

    if (error === "missing_fields") {
      toast.error("Name, company name, and date of birth are required.");
      shownRef.current = true;
      return;
    }

    if (error === "invalid_whatsapp") {
      toast.error("Enter a valid WhatsApp number (10 to 15 digits).");
      shownRef.current = true;
      return;
    }

    if (error === "invalid_email") {
      toast.error("Please enter a valid email address.");
      shownRef.current = true;
      return;
    }

    if (error === "email_exists") {
      toast.error("This email is already used by another vendor.");
      shownRef.current = true;
      return;
    }

    if (error === "underage") {
      toast.error("Vendor age must be 18 years or older.");
      shownRef.current = true;
      return;
    }

    if (error === "account_pending") {
      toast.info("Your account is pending admin approval. Features are currently disabled.");
      shownRef.current = true;
      return;
    }

    if (error === "images_required") {
      toast.error("Please choose at least one image.");
      shownRef.current = true;
      return;
    }

    if (error === "too_many_images") {
      toast.error("Too many images selected for one upload batch.");
      shownRef.current = true;
      return;
    }

    if (error === "images_unassigned") {
      toast.error("Assign every image to a category before saving.");
      shownRef.current = true;
      return;
    }

    if (error === "invalid_category_assignment") {
      toast.error("Some image category assignments were invalid. Please try again.");
      shownRef.current = true;
      return;
    }

    if (error === "image_too_large") {
      toast.error("Each image must be 8 MB or smaller.");
      shownRef.current = true;
      return;
    }

    if (error === "image_upload_failed") {
      toast.error("Image upload failed. Use JPG, PNG, or WEBP files.");
      shownRef.current = true;
      return;
    }

    if (error === "product_not_found") {
      toast.error("Product not found or access denied.");
      shownRef.current = true;
    }
  }, [status, error]);

  return null;
}
