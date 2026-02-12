import { env } from "@/env";

export async function GET() {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_AGENTS_API_URL}/agents/automation/status`,
      {
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error(`Agents API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Error fetching automation status:", error);
    return new Response(
      JSON.stringify({ enabled: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
