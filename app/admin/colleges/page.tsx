import { redirect } from "next/navigation";

export default function AdminCollegesPage() {
  redirect("/admin?tab=colleges");
}
