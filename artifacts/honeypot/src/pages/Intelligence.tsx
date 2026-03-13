import { Shell } from "@/components/layout/Shell";
import { Database, Link as LinkIcon, CreditCard, Phone, AlertCircle, ExternalLink, Shield, TrendingUp } from "lucide-react";
import { useGetIntelligence } from "@workspace/api-client-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

function GlowCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-h-[12rem] list-none", className)}>
      <div className="relative h-full rounded-2xl border border-border p-2">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />
        <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Intelligence() {
  const { data: intel, isLoading } = useGetIntelligence();

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Intelligence Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aggregated threat data extracted from all honeypot sessions
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 bg-card animate-pulse border border-border rounded-2xl"
              />
            ))}
          </div>
        ) : intel ? (
          <>
            {/* Stat row — clickable glowing cards */}
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/sessions">
                <GlowCard>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
                      <Database className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </div>
                  <p className="text-3xl font-bold font-mono mt-auto">
                    {intel.totalSessions}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total Sessions
                  </p>
                </GlowCard>
              </Link>

              <Link href="/sessions">
                <GlowCard>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </div>
                  <p className="text-3xl font-bold font-mono text-red-400 mt-auto">
                    {intel.scamSessionsCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Scams Detected
                  </p>
                </GlowCard>
              </Link>

              <GlowCard>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold font-mono text-orange-400 mt-auto">
                  {(intel.allPhishingLinks || []).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Phishing Links
                </p>
              </GlowCard>

              <GlowCard>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold font-mono text-yellow-400 mt-auto">
                  {(intel.allPhoneNumbers || []).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Suspect Phones
                </p>
              </GlowCard>
            </ul>

            {/* Bento data grid — glowing cards */}
            <ul className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Bank / UPI — tall left */}
              <GlowCard className="md:[grid-area:1/1/3/7]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-red-400" />
                  </div>
                  <h3 className="font-semibold text-sm">
                    Bank Accounts &amp; UPI IDs
                  </h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {[
                      ...(intel.allBankAccounts || []),
                      ...(intel.allUpiIds || []),
                    ].length}{" "}
                    records
                  </span>
                </div>
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-48">
                  {[
                    ...(intel.allBankAccounts || []),
                    ...(intel.allUpiIds || []),
                  ].length === 0 ? (
                    <p className="text-xs text-muted-foreground/60 py-4 text-center">
                      No data extracted yet
                    </p>
                  ) : (
                    [
                      ...(intel.allBankAccounts || []),
                      ...(intel.allUpiIds || []),
                    ].map((acc: string, i: number) => (
                      <div
                        key={i}
                        className="text-xs font-mono bg-red-500/5 border border-red-500/20 text-red-400 px-2.5 py-1.5 rounded"
                      >
                        {acc}
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Collected from scammer conversations — report to your bank's fraud team.
                </p>
              </GlowCard>

              {/* Phishing links — top right */}
              <GlowCard className="md:[grid-area:1/7/2/13]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-orange-400" />
                  </div>
                  <h3 className="font-semibold text-sm">Phishing Links</h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {(intel.allPhishingLinks || []).length} records
                  </span>
                </div>
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-36">
                  {!intel.allPhishingLinks?.length ? (
                    <p className="text-xs text-muted-foreground/60 py-4 text-center">
                      No links extracted yet
                    </p>
                  ) : (
                    intel.allPhishingLinks.map((link: string, i: number) => (
                      <div
                        key={i}
                        className="text-xs font-mono bg-orange-500/5 border border-orange-500/20 text-orange-400 px-2.5 py-1.5 rounded break-all"
                      >
                        {link}
                      </div>
                    ))
                  )}
                </div>
              </GlowCard>

              {/* Phone numbers — bottom right */}
              <GlowCard className="md:[grid-area:2/7/3/10]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-sm">Suspect Numbers</h3>
                </div>
                <div className="space-y-1.5 flex-1 overflow-y-auto max-h-36">
                  {!intel.allPhoneNumbers?.length ? (
                    <p className="text-xs text-muted-foreground/60 py-4 text-center">
                      None yet
                    </p>
                  ) : (
                    intel.allPhoneNumbers.map((phone: string, i: number) => (
                      <div
                        key={i}
                        className="text-xs font-mono bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 px-2.5 py-1.5 rounded"
                      >
                        {phone}
                      </div>
                    ))
                  )}
                </div>
              </GlowCard>

              {/* Keywords — bottom far right */}
              <GlowCard className="md:[grid-area:2/10/3/13]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Top Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {!intel.topKeywords?.length ? (
                    <p className="text-xs text-muted-foreground/60">None yet</p>
                  ) : (
                    intel.topKeywords.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full border font-mono",
                          i < 3
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "bg-muted text-muted-foreground border-border"
                        )}
                      >
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </GlowCard>
            </ul>
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <Shield className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              No intelligence gathered yet. Start analyzing messages.
            </p>
          </div>
        )}
      </div>
    </Shell>
  );
}
