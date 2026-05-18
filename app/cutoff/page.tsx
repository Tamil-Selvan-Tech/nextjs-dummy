import { CutoffClient } from "@/app/cutoff/cutoff-client";
import { fetchPublicPanelData } from "@/lib/public-data";

const DETAIL_PARAM_KEYS = [
  "phone",
  "physics",
  "chemistry",
  "maths",
  "engineeringScore",
  "neet",
  "boardTotal",
  "nata",
  "converted12th",
  "clat",
  "bestSubject1",
  "bestSubject2",
  "bestSubject3",
  "artsScienceCuet",
  "paramedicalBiology",
  "paramedicalPhysics",
  "paramedicalChemistry",
  "agricultureBiology",
  "agriculturePhysics",
  "agricultureChemistry",
] as const;

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
  const submittedDetails = Object.fromEntries(
    DETAIL_PARAM_KEYS.map((key) => [key, pick(params[key])]),
  );

  return (
    <CutoffClient
      selectedLevel={pick(params.level) || pick(params.standard) || pick(params.class)}
      selectedState={pick(params.state) || "Tamil Nadu"}
      selectedDegree={pick(params.degree)}
      selectedCourse={pick(params.course)}
      selectedSpecialization={pick(params.specialization)}
      selectedCategory={pick(params.category)}
      selectedDreamCollege={pick(params.dreamCollege)}
      selectedCollegeType={pick(params.collegeType)}
      selectedAdmissionType={pick(params.admissionType)}
      enteredCutoff={enteredScore}
      studentName={
        pick(params.name) ||
        pick(params.studentName) ||
        pick(params.fullName) ||
        pick(params.username)
      }
      submittedDetails={submittedDetails}
      colleges={panelData.colleges}
      courses={panelData.courses}
    />
  );
}
