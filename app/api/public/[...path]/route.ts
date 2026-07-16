import { NextRequest } from "next/server";

const BACKEND_BASE_URL = "http://localhost:5000";

const buildTargetUrl = (request: NextRequest, pathSegments: string[]) => {
  const pathname = `/api/public/${pathSegments.join("/")}`;
  const target = new URL(`${BACKEND_BASE_URL}${pathname}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });
  return target;
};

const proxyRequest = async (request: NextRequest, pathSegments: string[]) => {
  const targetUrl = buildTargetUrl(request, pathSegments);
  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers: {
      accept: request.headers.get("accept") || "*/*",
    },
    cache: "no-store",
  });

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/json",
    },
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path = [] } = await params;
  return proxyRequest(request, path);
}
