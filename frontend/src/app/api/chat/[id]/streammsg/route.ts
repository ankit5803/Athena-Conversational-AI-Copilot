import { NextRequest } from "next/server";
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const backendurl = process.env.BACKEND_URL || "http://localhost:8000";
  const { query } = await request.json();

  const response = await fetch(`${backendurl}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.ok || !response.body) {
    return new Response("Backend error", { status: 500 });
  }

  // Pipe the backend stream directly to the client
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
