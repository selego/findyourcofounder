"use client";

import { useEffect } from "react";

export function CityHubPing({ city, count }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "city_hub_view",
      city,
      hub_count: count,
    });
  }, [city, count]);
  return null;
}
