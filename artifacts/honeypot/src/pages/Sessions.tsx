import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Shield, ChevronRight, Clock, MessageSquare, Volume2, VolumeX, Play, RefreshCw } from "lucide-react";
import { useListSessions, useGetSession } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { cn, playVoice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function ListenModal({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const { data: session, isLoading } = useGetSession(sessionId);
  const { toast } = useToast();
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const speak = (text: string, idx: number) => {
    setPlayingIdx(idx);
    playVoice(text);
    // Estimate duration from text length, min 3s
    const duration = Math.max(3000, text.length * 55);
    setTimeout(() => setPlayingIdx(null), duration);
  };

  const playAll = async () => {
    if (!session?.conversation) return;
    const agentTurns = session.conversation
      .map((t, i) => ({ ...t, idx: i }))
      .filter(t => t.role === "agent" || t.role === "assistant");

    for (const turn of agentTurns) {
      speak(turn.content, turn.idx);
      const duration = Math.max(3500, turn.content.length * 55);
      await new Promise(r => setTimeout(r, duration + 500));
    }
    toast({ title: "Playback complete", description: "All agent responses have been read out." });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold">Listen to Conversation</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">{sessionId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={playAll}
              className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
            >
              <Play className="w-3.5 h-3.5" /> Play All Agent Responses
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm px-2">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading conversation...
            </div>
          ) : (
            session?.conversation?.map((turn, idx) => {
              const isAgent = turn.role === "agent" || turn.role === "assistant";
              return (
                <div key={idx} className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-lg p-3 border text-sm",
                    isAgent
                      ? "bg-primary/10 border-primary/20 text-foreground"
                      : "bg-background border-border text-foreground"
                  )}>
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className={cn("text-xs font-medium", isAgent ? "text-primary" : "text-orange-400")}>
                        {isAgent ? "AI Agent (Ramesh)" : "Scammer"}
                      </span>
                      <span className="text-xs text-muted-foreground">{format(new Date(turn.timestamp), "HH:mm:ss")}</span>
                    </div>
                    <p className="leading-relaxed">{turn.content}</p>
                    {isAgent && (
                      <button
                        onClick={() => speak(turn.content, idx)}
                        className="mt-2 flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
                      >
                        {playingIdx === idx ? (
                          <><VolumeX className="w-3.5 h-3.5" /> Playing...</>
                        ) : (
                          <><Volume2 className="w-3.5 h-3.5" /> Listen</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function Sessions() {
  const { data: sessions, isLoading, error } = useListSessions();
  const [listeningId, setListeningId] = useState<string | null>(null);

  const statusColor = (status: string, scamDetected: boolean) => {
    if (status === "complete") return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    if (status === "engaged") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    if (scamDetected) return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Active Sessions</h1>
            <p className="text-sm text-muted-foreground mt-0.5">All honeypot interception sessions</p>
          </div>
          {sessions && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{sessions.filter(s => s.scamDetected).length}</span> scams / {sessions.length} total
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-card animate-pulse border border-border rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5 border border-red-500/30 bg-red-500/10 text-red-400 rounded-lg text-sm">
            Failed to load sessions.
          </div>
        ) : !sessions?.length ? (
          <div className="text-center py-20 border border-dashed border-border rounded-lg">
            <Shield className="w-10 h-10 mx-auto text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground text-sm">No sessions yet. Analyze a message to start.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...sessions].reverse().map(session => (
              <div key={session.sessionId} className="bg-card border border-border hover:border-primary/30 rounded-lg transition-colors">
                <Link href={`/sessions/${session.sessionId}`}>
                  <div className="px-4 py-3 flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        session.status === "engaged" ? "bg-orange-500 animate-pulse" :
                        session.scamDetected ? "bg-red-500" : "bg-emerald-500"
                      )} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-foreground truncate">{session.sessionId}</span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full border hidden sm:block", statusColor(session.status, session.scamDetected))}>
                            {session.status}
                          </span>
                          {session.scamType && (
                            <span className="text-xs text-muted-foreground hidden md:block">{session.scamType}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(session.startedAt), "MMM d, HH:mm")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {session.totalMessages} messages
                          </span>
                          <span className="flex items-center gap-1">
                            {session.channel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={cn(
                        "text-lg font-bold font-mono",
                        session.scamProbability >= 70 ? "text-red-400" :
                        session.scamProbability >= 30 ? "text-orange-400" : "text-emerald-400"
                      )}>
                        {session.scamProbability}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>

                {/* Listen button row */}
                <div className="px-4 pb-3 flex items-center gap-2">
                  <button
                    onClick={() => setListeningId(session.sessionId)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/40 px-3 py-1 rounded-md transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Listen to Conversation
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {listeningId && (
        <ListenModal sessionId={listeningId} onClose={() => setListeningId(null)} />
      )}
    </Shell>
  );
}
