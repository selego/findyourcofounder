"use client";

import { useEffect } from "react";

export function SkillHubPing({ skill, count }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "skill_hub_view",
      skill,
      hub_count: count,
    });
  }, [skill, count]);
  return null;
}
