import { env } from "@/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}) as any);
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_AGENTS_API_URL}/agents/automation/start`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (!response.ok) {
      throw new Error(`Agents API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Error starting automation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
