import { CutoffClient } from "@/app/cutoff/cutoff-client";
import { fetchPublicPanelData } from "@/lib/public-data";

// Cutoff page server entry: reads search params and hydrates the cutoff client with public data.
export default async function CutoffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pick = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] || "" : value || "";
  const enteredScore = pick(params.cutoff) || pick(params.marks) || pick(params.rank);
  const panelData = await fetchPublicPanelData();

  return (
    <CutoffClient
      selectedLevel={pick(params.level) || pick(params.standard) || pick(params.class)}
      selectedDegree={pick(params.degree)}
      selectedCourse={pick(params.course)}
      selectedSpecialization={pick(params.specialization)}
      selectedCategory={pick(params.category)}
      selectedCollegeType={pick(params.collegeType)}
      selectedAdmissionType={pick(params.admissionType)}
      enteredCutoff={enteredScore}
      studentName={
        pick(params.name) ||
        pick(params.studentName) ||
        pick(params.fullName) ||
        pick(params.username)
      }
      colleges={panelData.colleges}
      courses={panelData.courses}
    />
  );
}
