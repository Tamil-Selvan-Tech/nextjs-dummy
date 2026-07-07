import { Suspense } from "react";
import { SearchResultsClient } from "./search-results-client";

export default function SearchResultsPage() {
  return (
    <Suspense fallback={null}>
      <SearchResultsClient />
    </Suspense>
  );
}
