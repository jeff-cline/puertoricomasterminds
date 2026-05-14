// app/(public)/masterminds/gate/[origin]/page.tsx
import { notFound } from "next/navigation";
import { GateForm } from "@/components/gate/gate-form";
import { getMastermindBySlug } from "@/lib/masterminds/queries";

export default async function MastermindGatePage({
  params,
}: {
  params: Promise<{ origin: string }>;
}) {
  const { origin: rawOrigin } = await params;
  const origin = decodeURIComponent(rawOrigin);
  const [kind, slug] = origin.split(":");
  if (kind !== "masterminds" || !slug) notFound();

  const m = await getMastermindBySlug(slug);
  if (!m) notFound();

  return (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-prm-teal/10 via-white to-prm-coral/10 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
            Help us understand what our growing island community is looking for.
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Take a quick survey to help shape future masterminds, then we'll send you to {m.title}.
          </p>
        </div>
        <div className="mt-10">
          <GateForm
            origin={origin}
            funnel="masterminds"
            noPathRedirectUrl={m.destination_url}
            yesPathHref="/masterminds/survey"
          />
        </div>
      </div>
    </div>
  );
}
