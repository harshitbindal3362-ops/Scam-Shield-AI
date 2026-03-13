import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { FileText, Download, ChevronRight } from "lucide-react";
import { useListSessions } from "@workspace/api-client-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export function Reports() {
  const { data: sessions, isLoading } = useListSessions();
  const [filter, setFilter] = useState<"all" | "scam" | "safe">("all");

  const filtered = (sessions || []).filter(s => {
    if (filter === "scam") return s.scamDetected;
    if (filter === "safe") return !s.scamDetected;
    return true;
  });

  const exportCSV = () => {
    if (!sessions?.length) return;
    const header = "Session ID,Date,Verdict,Scam Type,Threat Score,Messages,Channel,Status";
    const rows = sessions.map(s => [
      s.sessionId,
      format(new Date(s.startedAt), "yyyy-MM-dd HH:mm"),
      s.scamDetected ? "Scam" : "Safe",
      s.scamType || "N/A",
      `${s.scamProbability}%`,
      s.totalMessages,
      s.channel,
      s.status,
    ].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `honeypot_sessions_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Session Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Historical interception logs and analysis records</p>
          </div>
          <button
            onClick={exportCSV}
            disabled={!sessions?.length}
            className="flex items-center gap-2 text-sm border border-border hover:border-primary/40 bg-card px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Summary cards */}
        {sessions && sessions.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Sessions", value: sessions.length, color: "text-foreground" },
              { label: "Scams Detected", value: sessions.filter(s => s.scamDetected).length, color: "text-red-400" },
              { label: "Safe Signals", value: sessions.filter(s => !s.scamDetected).length, color: "text-emerald-400" },
              { label: "Completed", value: sessions.filter(s => s.status === "complete").length, color: "text-primary" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-lg p-4">
                <p className={cn("text-2xl font-bold font-mono", color)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 w-fit">
          {(["all", "scam", "safe"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md capitalize transition-colors",
                filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all" ? "All" : f === "scam" ? "Scam" : "Safe"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background/50">
              <tr>
                {["Session ID", "Date & Time", "Verdict", "Type", "Score", "Messages", "Status", ""].map(h => (
                  <th key={h} className="text-left text-xs text-muted-foreground font-medium px-4 py-3 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">No records found.</td></tr>
              ) : (
                [...filtered].reverse().map(session => (
                  <tr key={session.sessionId} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{session.sessionId}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {format(new Date(session.startedAt), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full border font-medium",
                        session.scamDetected
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}>
                        {session.scamDetected ? "Scam" : "Safe"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{session.scamType || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "font-mono text-sm font-semibold",
                        session.scamProbability >= 70 ? "text-red-400" :
                        session.scamProbability >= 30 ? "text-orange-400" : "text-emerald-400"
                      )}>
                        {session.scamProbability}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{session.totalMessages}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full border",
                        session.status === "complete"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : session.status === "engaged"
                          ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      )}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/sessions/${session.sessionId}`}>
                        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="w-3.5 h-3.5" />
          <span>Click any session to view full conversation and generate an FIR report.</span>
        </div>
      </div>
    </Shell>
  );
}
