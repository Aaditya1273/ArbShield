import { env } from "@/env";

export async function POST() {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_AGENTS_API_URL}/agents/automation/stop`,
      {
        method: "POST",
      },
    );
    if (!response.ok) {
      throw new Error(`Agents API responded with status: ${response.status}`);
    }
    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("Error stopping automation:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
