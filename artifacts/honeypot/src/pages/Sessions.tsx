import { Shell } from "@/components/layout/Shell";
import { CyberCard, CyberBadge } from "@/components/ui/cyber-ui";
import { ShieldAlert, ChevronRight, Clock, MessageSquare } from "lucide-react";
import { useListSessions } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";

export function Sessions() {
  const { data: sessions, isLoading, error } = useListSessions();

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Active Sessions
          </h2>
          <p className="text-muted-foreground mt-2">Monitor engaged honeypot instances</p>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-24 bg-card/50 animate-pulse border border-border" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 border border-destructive text-destructive bg-destructive/10">
            Failed to load sessions database.
          </div>
        ) : sessions?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border">
            <p className="text-muted-foreground font-mono">No active sessions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions?.map((session) => (
              <Link key={session.sessionId} href={`/sessions/${session.sessionId}`}>
                <CyberCard className="group cursor-pointer hover:bg-white/5 transition-all p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-primary font-bold">{session.sessionId}</span>
                      {session.status === 'engaged' ? (
                        <span className="flex items-center gap-2 text-xs font-bold text-warning uppercase">
                          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" /> Engaged
                        </span>
                      ) : (
                        <CyberBadge variant={session.scamDetected ? "destructive" : "success"}>
                          {session.status}
                        </CyberBadge>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground font-mono">
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4"/> {format(new Date(session.startedAt), "MMM dd, HH:mm:ss")}</span>
                      <span className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> {session.totalMessages} turns</span>
                      {session.scamType && <span>Type: {session.scamType}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <div className="text-xl font-bold font-mono text-foreground">
                        {Math.round(session.scamProbability * 100)}%
                      </div>
                      <div className="text-[10px] uppercase text-muted-foreground">Threat Score</div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CyberCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
