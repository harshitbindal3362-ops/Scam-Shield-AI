import { Shell } from "@/components/layout/Shell";
import { Database, Link as LinkIcon, CreditCard, Phone, AlertCircle, ExternalLink } from "lucide-react";
import { useGetIntelligence } from "@workspace/api-client-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export function Intelligence() {
  const { data: intel, isLoading } = useGetIntelligence();

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Intelligence Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Aggregated threat data extracted from all honeypot sessions</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-card animate-pulse border border-border rounded-lg" />
            ))}
          </div>
        ) : intel ? (
          <>
            {/* Stat cards — clickable to sessions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/sessions">
                <div className="bg-card border border-border hover:border-primary/40 rounded-lg p-4 cursor-pointer transition-colors group">
                  <p className="text-2xl font-bold font-mono text-foreground">{intel.totalSessions}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Sessions</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3" /> View sessions
                  </div>
                </div>
              </Link>

              <Link href="/sessions?filter=scam">
                <div className="bg-card border border-border hover:border-red-500/40 rounded-lg p-4 cursor-pointer transition-colors group">
                  <p className="text-2xl font-bold font-mono text-red-400">{intel.scamSessionsCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Scams Detected</p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3" /> View scams
                  </div>
                </div>
              </Link>

              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-2xl font-bold font-mono text-orange-400">
                  {(intel.allPhishingLinks || []).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Phishing Links</p>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-2xl font-bold font-mono text-yellow-400">
                  {(intel.allPhoneNumbers || []).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Suspect Phones</p>
              </div>
            </div>

            {/* Data grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Bank/UPI */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-red-400" />
                  <h3 className="font-medium text-sm">Bank Accounts & UPI IDs</h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {[...(intel.allBankAccounts || []), ...(intel.allUpiIds || [])].length} records
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {[...(intel.allBankAccounts || []), ...(intel.allUpiIds || [])].length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No data extracted yet</p>
                  ) : (
                    [...(intel.allBankAccounts || []), ...(intel.allUpiIds || [])].map((acc: string, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono bg-red-500/5 border border-red-500/20 text-red-400 px-2.5 py-1.5 rounded">
                        <span className="truncate">{acc}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Phishing links */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-4 h-4 text-orange-400" />
                  <h3 className="font-medium text-sm">Phishing Links</h3>
                  <span className="ml-auto text-xs text-muted-foreground">{(intel.allPhishingLinks || []).length} records</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {!intel.allPhishingLinks?.length ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No links extracted yet</p>
                  ) : (
                    intel.allPhishingLinks.map((link: string, i: number) => (
                      <div key={i} className="text-xs font-mono bg-orange-500/5 border border-orange-500/20 text-orange-400 px-2.5 py-1.5 rounded break-all">
                        {link}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Phone numbers */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-medium text-sm">Suspect Phone Numbers</h3>
                  <span className="ml-auto text-xs text-muted-foreground">{(intel.allPhoneNumbers || []).length} records</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {!intel.allPhoneNumbers?.length ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No numbers extracted yet</p>
                  ) : (
                    intel.allPhoneNumbers.map((phone: string, i: number) => (
                      <div key={i} className="text-xs font-mono bg-yellow-500/5 border border-yellow-500/20 text-yellow-400 px-2.5 py-1.5 rounded">
                        {phone}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Keywords */}
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-sm">Top Scam Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {!intel.topKeywords?.length ? (
                    <p className="text-xs text-muted-foreground py-4">No keywords yet</p>
                  ) : (
                    intel.topKeywords.map((kw: string, i: number) => (
                      <span key={i} className={cn(
                        "text-xs px-2.5 py-1 rounded-full border font-mono",
                        i < 3
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-background border-border text-muted-foreground"
                      )}>
                        {kw}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <Database className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No intelligence gathered yet. Start analyzing messages.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
