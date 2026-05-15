// components/public/mode-toggle.tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type ExcursionMode = "cruise_day" | "multi_day";

// Inactive style: fire-orange text with a 4-direction teal outline so the
// label is legible on the white pill regardless of the hero image behind.
// Active style: solid teal pill with white text (unchanged).
const INACTIVE_STYLE: React.CSSProperties = {
  color: "#FF6A1F",
  textShadow:
    "-1px -1px 0 #0FB5BA, 1px -1px 0 #0FB5BA, -1px 1px 0 #0FB5BA, 1px 1px 0 #0FB5BA, 0 0 2px #0FB5BA",
};

export function ModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const mode = (sp.get("mode") as ExcursionMode) ?? "cruise_day";

  const set = (next: ExcursionMode) => {
    const newSp = new URLSearchParams(sp.toString());
    newSp.set("mode", next);
    router.push(`${pathname}?${newSp.toString()}`, { scroll: false });
  };

  return (
    <div className="inline-flex items-center rounded-full border bg-white p-1 shadow-sm">
      <button
        type="button"
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          mode === "cruise_day" ? "bg-prm-teal text-white" : ""
        }`}
        style={mode === "cruise_day" ? undefined : INACTIVE_STYLE}
        onClick={() => set("cruise_day")}
      >
        Cruise Day
      </button>
      <button
        type="button"
        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
          mode === "multi_day" ? "bg-prm-teal text-white" : ""
        }`}
        style={mode === "multi_day" ? undefined : INACTIVE_STYLE}
        onClick={() => set("multi_day")}
      >
        Staying Multiple Days
      </button>
    </div>
  );
}
