import { redirect } from "next/navigation";

export default function AdminCourseRequestsPage() {
  redirect("/admin?tab=course-requests");
}
