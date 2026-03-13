import { Shell } from "@/components/layout/Shell";
import { CyberCard } from "@/components/ui/cyber-ui";
import { Database, Link as LinkIcon, CreditCard, Phone, AlertCircle } from "lucide-react";
import { useGetIntelligence } from "@workspace/api-client-react";

export function Intelligence() {
  const { data: intel, isLoading } = useGetIntelligence();

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Intelligence Board
          </h2>
          <p className="text-muted-foreground mt-2">Aggregated threat data extracted by Honeypot agents</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-card/50 animate-pulse border border-border" />)}
          </div>
        ) : intel ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CyberCard className="border-t-4 border-t-primary flex flex-col items-center text-center justify-center py-8">
                <Database className="w-10 h-10 text-primary mb-4" />
                <div className="text-4xl font-bold font-mono">{intel.totalSessions}</div>
                <div className="text-sm text-muted-foreground uppercase mt-2">Total Sessions</div>
              </CyberCard>
              
              <CyberCard className="border-t-4 border-t-destructive flex flex-col items-center text-center justify-center py-8">
                <AlertCircle className="w-10 h-10 text-destructive mb-4" />
                <div className="text-4xl font-bold font-mono text-destructive">{intel.scamSessionsCount}</div>
                <div className="text-sm text-muted-foreground uppercase mt-2">Scams Detected</div>
              </CyberCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <CyberCard>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><CreditCard className="w-5 h-5 text-primary"/> Extracted Bank Accounts / UPI</h3>
                <div className="space-y-2">
                  {[...(intel.allBankAccounts||[]), ...(intel.allUpiIds||[])].length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                  {[...(intel.allBankAccounts||[]), ...(intel.allUpiIds||[])].map((acc, i) => (
                    <div key={i} className="p-2 bg-destructive/10 border border-destructive/20 text-destructive font-mono text-sm">
                      {acc}
                    </div>
                  ))}
                </div>
              </CyberCard>

              <CyberCard>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><LinkIcon className="w-5 h-5 text-primary"/> Malicious Links</h3>
                <div className="space-y-2">
                  {intel.allPhishingLinks?.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                  {intel.allPhishingLinks?.map((link, i) => (
                    <div key={i} className="p-2 bg-warning/10 border border-warning/20 text-warning font-mono text-sm break-all">
                      {link}
                    </div>
                  ))}
                </div>
              </CyberCard>

              <CyberCard>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Phone className="w-5 h-5 text-primary"/> Suspicious Phone Numbers</h3>
                <div className="space-y-2">
                  {intel.allPhoneNumbers?.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                  {intel.allPhoneNumbers?.map((phone, i) => (
                    <div key={i} className="p-2 bg-primary/10 border border-primary/20 text-primary font-mono text-sm">
                      {phone}
                    </div>
                  ))}
                </div>
              </CyberCard>
              
              <CyberCard>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><AlertCircle className="w-5 h-5 text-primary"/> Top Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {intel.topKeywords?.length === 0 && <p className="text-muted-foreground text-sm">No data yet.</p>}
                  {intel.topKeywords?.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 border border-border text-foreground font-mono text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </CyberCard>
            </div>
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-border text-muted-foreground">
            No intelligence gathered yet.
          </div>
        )}
      </div>
    </Shell>
  );
}
