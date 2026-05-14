// app/(admin)/admin/cruise-calendar/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { CruiseForm } from "./cruise-form";

export default async function CruiseCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const date = sp.date ?? today;

  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("daily_port_calls").select("*").eq("call_date", date) as any;
  const initialShips = ((data ?? []) as Array<{ ship_name: string }>).map((r) => r.ship_name);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Cruise Calendar</h1>
        <p className="mt-1 text-muted-foreground">
          Tag which ships are in port. Every lead created today inherits the day&apos;s ship list,
          giving you ship-level segmentation in analytics.
        </p>
      </header>
      <CruiseForm initialDate={date} initialShips={initialShips} />
    </div>
  );
}
