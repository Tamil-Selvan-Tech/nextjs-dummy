import { redirect } from "next/navigation";

export default function AdminCutoffQuestionsPage() {
  redirect("/admin?tab=cutoff-questions");
}
