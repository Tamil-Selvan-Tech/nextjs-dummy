import { HomePage } from "@/components/home-page";
import { fetchPublicPanelData } from "@/lib/public-data";

export default async function Page() {
  const panelData = await fetchPublicPanelData();

  return (
    <HomePage
      collegesData={panelData.colleges}
      coursesData={panelData.courses}
      heroImageUrl={panelData.homeHeroImageUrl}
      examSchedules={panelData.examSchedules}
    />
  );
}
