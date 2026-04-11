import { CutoffClient } from "@/app/cutoff/cutoff-client";
import { fetchPublicPanelData } from "@/lib/public-data";

export default async function CutoffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const pick = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] || "" : value || "";
  const panelData = await fetchPublicPanelData();

  return (
    <CutoffClient
      selectedLevel={pick(params.level)}
      selectedDegree={pick(params.degree)}
      selectedCourse={pick(params.course)}
      selectedSpecialization={pick(params.specialization)}
      enteredCutoff={pick(params.cutoff)}
      colleges={panelData.colleges}
    />
  );
}
