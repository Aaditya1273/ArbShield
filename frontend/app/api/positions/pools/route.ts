import { env } from "@/env";

export async function GET() {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_AGENTS_API_URL}/positions/pools`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Agents API error: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error("API Route Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch pool metrics" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
