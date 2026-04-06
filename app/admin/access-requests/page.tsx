import { redirect } from "next/navigation";

export default function AdminAccessRequestsPage() {
  redirect("/admin?tab=access-requests");
}
