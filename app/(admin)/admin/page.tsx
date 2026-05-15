// app/(admin)/admin/page.tsx
// Server component — fetches all data and passes to client sub-components.
export const dynamic = "force-dynamic";

import {
  getKpiSparklines,
  getFunnelStages,
  getComingSoonLeaderboard,
  getCruisePaxBreakdown,
  getCruisePaxOverTime,
  getTrendingExcursions,
  getLiveActivity,
  getTodayPortCalls,
} from "@/lib/admin/overview-queries";

import { HeroTicker } from "@/components/admin/dashboard/ticker";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";
import { ConversionFunnel } from "@/components/admin/dashboard/conversion-funnel";
import { ComingSoonChart } from "@/components/admin/dashboard/coming-soon-chart";
import { CruisePaxPanel } from "@/components/admin/dashboard/cruise-pax-panel";
import { TrendingExcursions } from "@/components/admin/dashboard/trending-excursions";
import { IndustryStatsGrid } from "@/components/admin/dashboard/industry-stats-grid";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="font-jakarta text-xl font-bold text-secondary">{title}</h2>
      {subtitle && (
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const today = new Date().toISOString().slice(0, 10);

  // Fetch all data in parallel
  const [
    kpi,
    funnelStages,
    comingSoon,
    donut,
    stackedPax,
    trending,
    activity,
    portCalls,
  ] = await Promise.all([
    getKpiSparklines(),
    getFunnelStages(),
    getComingSoonLeaderboard(),
    getCruisePaxBreakdown(today),
    getCruisePaxOverTime(14),
    getTrendingExcursions(30),
    getLiveActivity(20),
    getTodayPortCalls(),
  ]);

  // Compute ticker props
  const portCallCount = portCalls.length;
  const portCallShips = portCalls.map((p) => p.ship_name);
  const leadsWeekDelta =
    kpi.prevLeads30d > 0
      ? `${kpi.totalLeads30d >= kpi.prevLeads30d ? "+" : ""}${(
          ((kpi.totalLeads30d - kpi.prevLeads30d) / kpi.prevLeads30d) *
          100
        ).toFixed(0)}%`
      : kpi.totalLeads30d > 0
      ? "+new"
      : "0";

  const topBorda = comingSoon[0]?.title;
  const topExcursion = trending.find((t) => t.current > 0)?.title;

  // KPI gate yes rate — compute from funnel
  const gateYesRate =
    funnelStages[1]?.value && funnelStages[1].value > 0
      ? Math.round((funnelStages[2]?.value / funnelStages[1].value) * 100)
      : 0;

  return (
    <div
      className="space-y-10"
      style={{
        background: "linear-gradient(180deg, #f8fafc 0%, #f0f4f8 100%)",
        minHeight: "100%",
      }}
    >
      {/* ── Section 1: Hero Ticker ─────────────────────────────────── */}
      <HeroTicker
        portCallCount={portCallCount}
        portCallShips={portCallShips}
        leadsWeekDelta={leadsWeekDelta}
        topExcursion={topExcursion}
        topBorda={topBorda}
      />

      {/* ── Section 2: KPI Cards ───────────────────────────────────── */}
      <section>
        <SectionHeading
          title="The Big Picture"
          subtitle="Live metrics — last 30 days vs. previous 30 days"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Leads captured (30d)"
            value={kpi.totalLeads30d}
            previousValue={kpi.prevLeads30d}
            data={kpi.leads30d}
            color="#0FB5BA"
            description="All funnels combined"
          />
          <KpiCard
            label="Gate YES (30d)"
            value={kpi.totalGateYes}
            previousValue={kpi.prevGateYes}
            data={kpi.gateYes30d}
            color="#FF7A45"
            description={`${gateYesRate}% gate conversion`}
          />
          <KpiCard
            label="Coming Soon votes (30d)"
            value={kpi.totalRankings}
            previousValue={kpi.prevRankings}
            data={kpi.rankings30d}
            color="#9B59B6"
            description="Borda rank submits"
          />
          <KpiCard
            label="Real estate inquiries (30d)"
            value={kpi.totalRealEstate}
            previousValue={kpi.prevRealEstate}
            data={kpi.realEstate30d}
            color="#27AE60"
            description="Act 60 / RE funnel"
          />
        </div>
      </section>

      {/* ── Sections 3-6 in main+sidebar layout ───────────────────── */}
      <div className="grid gap-10 xl:grid-cols-[1fr_340px]">
        <div className="space-y-10 min-w-0">
          {/* ── Section 3: Conversion Funnel ─────────────────────── */}
          <section>
            <SectionHeading
              title="Visitor Funnel"
              subtitle="From first impression to Viator booking — all-time"
            />
            <ConversionFunnel stages={funnelStages} />
          </section>

          {/* ── Section 4: Coming Soon Leaderboard ───────────────── */}
          <section>
            <SectionHeading
              title="What Visitors Want"
              subtitle="Coming Soon experiences ranked by Borda score — all votes"
            />
            <ComingSoonChart items={comingSoon} />
          </section>

          {/* ── Section 5: Cruise Pax Breakdown ──────────────────── */}
          <section>
            <SectionHeading
              title="Who's Coming"
              subtitle="Daily cruise ship mix by passenger segment"
            />
            <CruisePaxPanel donut={donut} stacked={stackedPax} today={today} />
          </section>

          {/* ── Section 6: Trending Excursions ────────────────────── */}
          <section>
            <SectionHeading
              title="Top Excursions Trending Up"
              subtitle="Most-clicked in last 30 days vs. previous 30 days"
            />
            <TrendingExcursions items={trending} />
          </section>

          {/* ── Section 7: Industry Context ───────────────────────── */}
          <section>
            <SectionHeading
              title="Why Invest in Puerto Rico Tourism Now"
              subtitle="Cited industry data — sources linked below each stat"
            />
            <IndustryStatsGrid />
          </section>
        </div>

        {/* ── Section 8: Live Activity Feed (sidebar) ──────────── */}
        <aside className="space-y-4">
          <SectionHeading
            title="Live Activity"
            subtitle="Last 20 events"
          />
          <ActivityFeed items={activity} />

          {/* Port calls today mini-card */}
          {portCalls.length > 0 && (
            <div
              className="rounded-2xl p-5 text-white shadow-sm"
              style={{
                background:
                  "linear-gradient(135deg, #0A2540 0%, #0c3060 100%)",
              }}
            >
              <p className="text-xs uppercase tracking-wide opacity-60 mb-2">
                In Port Today
              </p>
              <ul className="space-y-1.5">
                {portCalls.map((p, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span>🚢</span>
                    <div>
                      <p className="text-sm font-semibold">{p.ship_name}</p>
                      <p className="text-xs opacity-60">
                        {p.cruise_line} ·{" "}
                        {p.demo_segment.replace(/_/g, " ")} ·{" "}
                        {p.call_type.replace(/_/g, " ")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
