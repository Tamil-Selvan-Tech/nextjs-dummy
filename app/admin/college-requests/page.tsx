import { redirect } from "next/navigation";

export default function AdminCollegeRequestsPage() {
  redirect("/admin?tab=college-requests");
}
