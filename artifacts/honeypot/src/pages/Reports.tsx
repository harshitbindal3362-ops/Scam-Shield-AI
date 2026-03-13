import { Shell } from "@/components/layout/Shell";
import { CyberCard, CyberButton } from "@/components/ui/cyber-ui";
import { FileText, Download } from "lucide-react";
import { useListSessions, useFinalizeSession } from "@workspace/api-client-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function Reports() {
  const { data: sessions, isLoading } = useListSessions();

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Reports & Logs
            </h2>
            <p className="text-muted-foreground mt-2">Historical data and GUVI integration status</p>
          </div>
          <CyberButton variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4"/> Export CSV
          </CyberButton>
        </header>

        <CyberCard className="overflow-x-auto p-0">
          <table className="w-full text-left font-sans">
            <thead className="bg-muted text-muted-foreground font-display text-sm uppercase">
              <tr>
                <th className="p-4 border-b border-border font-medium">Session ID</th>
                <th className="p-4 border-b border-border font-medium">Date</th>
                <th className="p-4 border-b border-border font-medium">Verdict</th>
                <th className="p-4 border-b border-border font-medium">Turns</th>
                <th className="p-4 border-b border-border font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading logs...</td></tr>
              ) : sessions?.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No historical data available.</td></tr>
              ) : (
                sessions?.map((session) => (
                  <tr key={session.sessionId} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-primary text-sm">{session.sessionId}</td>
                    <td className="p-4 text-sm text-muted-foreground">{format(new Date(session.startedAt), "yyyy-MM-dd HH:mm")}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-1 text-xs font-bold uppercase", session.scamDetected ? "text-destructive bg-destructive/10" : "text-success bg-success/10")}>
                        {session.scamDetected ? "Scam" : "Safe"}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono">{session.totalMessages}</td>
                    <td className="p-4">
                      <span className={cn("px-2 py-1 text-xs font-bold uppercase border", session.status === 'complete' ? "border-primary text-primary" : "border-warning text-warning")}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CyberCard>
      </div>
    </Shell>
  );
}
