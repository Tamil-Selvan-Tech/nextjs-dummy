import { ExploreClient } from "@/app/explore/explore-client";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] || "" : params.q || "";
  const stream = Array.isArray(params.stream) ? params.stream[0] || "" : params.stream || "";
  const view = Array.isArray(params.view) ? params.view[0] || "" : params.view || "";
  const city = Array.isArray(params.city) ? params.city[0] || "" : params.city || "";
  const college = Array.isArray(params.college) ? params.college[0] || "" : params.college || "";

  return (
    <ExploreClient
      query={query}
      streamFilter={stream}
      initialView={view}
      cityFilter={city}
      collegeFilter={college}
    />
  );
}
