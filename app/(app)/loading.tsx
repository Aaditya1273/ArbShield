"use client";

import Loader from "@/components/ui/loader";

export default function AppLoading() {
  return (
    <Loader
      title="Loading dashboard…"
      subtitle="Please wait while we prepare everything for you"
      size="md"
    />
  );
}
