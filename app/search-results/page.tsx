import { Suspense } from "react";
import { fetchPublicPanelData } from "@/lib/public-data";
import { SearchResultsClient } from "./search-results-client";

export default async function SearchResultsPage() {
  const panelData = await fetchPublicPanelData();

  return (
    <Suspense fallback={null}>
      <SearchResultsClient
        collegesData={panelData.colleges}
        coursesData={panelData.courses}
      />
    </Suspense>
  );
}
