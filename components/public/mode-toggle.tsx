// components/public/mode-toggle.tsx
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export type ExcursionMode = "cruise_day" | "multi_day";

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
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          mode === "cruise_day" ? "bg-prm-teal text-white" : "text-secondary"
        }`}
        onClick={() => set("cruise_day")}
      >
        Cruise Day
      </button>
      <button
        type="button"
        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
          mode === "multi_day" ? "bg-prm-teal text-white" : "text-secondary"
        }`}
        onClick={() => set("multi_day")}
      >
        Staying Multiple Days
      </button>
    </div>
  );
}
