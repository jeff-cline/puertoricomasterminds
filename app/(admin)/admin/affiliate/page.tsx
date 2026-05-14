// app/(admin)/admin/affiliate/page.tsx
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";

export default async function AffiliatePage() {
  const me = await getCurrentAdminUser();
  if (!me) redirect("/admin/login");

  const pid = process.env.VIATOR_PID ?? "(unset)";
  const mcid = process.env.VIATOR_MCID ?? "(unset)";
  const medium = process.env.VIATOR_MEDIUM ?? "(unset)";

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Affiliate Config</h1>
        <p className="mt-1 text-muted-foreground">Current affiliate plumbing for Viator and Expedia (read-only v1; swap UI in phase 2).</p>
      </header>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-secondary">Viator</h3>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Partner ID (pid)</dt><dd className="font-mono">{pid}</dd>
          <dt className="text-muted-foreground">Marketing channel (mcid)</dt><dd className="font-mono">{mcid}</dd>
          <dt className="text-muted-foreground">Medium</dt><dd className="font-mono">{medium}</dd>
          <dt className="text-muted-foreground">Fallback URL</dt>
          <dd className="font-mono break-all">https://www.viator.com/Puerto-Rico-attractions/San-Juan-Gate/d36-a19408</dd>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Update by editing env vars (VIATOR_PID, VIATOR_MCID, VIATOR_MEDIUM) on the host.
        </p>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-secondary">Expedia Group</h3>
        <p className="text-sm">Banner widget renders in the public footer + /coupon page.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          <strong>To verify:</strong> the banner ships with <code>data-camref=&quot;undefined&quot;</code> (a literal string).
          Check the Expedia affiliate dashboard whether <code>data-pubref=&quot;Puerto-Rico&quot;</code> is sufficient for
          attribution, or whether a real camref is required.
        </p>
      </section>
    </div>
  );
}
