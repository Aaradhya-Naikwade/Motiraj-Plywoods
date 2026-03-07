import { redirect } from "next/navigation";
export default function VendorSignupPage() {
  redirect("/vendor/auth?tab=register");
}
