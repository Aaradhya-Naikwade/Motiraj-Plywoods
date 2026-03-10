"use server";

import { redirect } from "next/navigation";
import { createLead } from "@/lib/lead-repo";

export async function submitContactLeadAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !phone || !email || !message) {
    redirect("/contact?error=missing_fields");
  }

  await createLead({
    name,
    phone,
    email,
    message,
    source: "Contact Page",
    status: "new",
    notes: null,
  });

  redirect("/contact?status=success");
}
