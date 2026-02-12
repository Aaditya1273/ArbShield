import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
    short_name:
      "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
    description:
      "LiquidMesh - The AI orchestration layer for concentrated liquidity on Somnia.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
  };
}
