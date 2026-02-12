import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArbShield - Privacy-Preserving Compliance Verification Engine for Institutional RWAs on Arbitrum",
    short_name:
      "ArbShield - Privacy-Preserving Compliance on Arbitrum",
    description:
      "ArbShield - Privacy-Preserving Compliance Verification Engine for Institutional RWAs on Arbitrum",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
  };
}
