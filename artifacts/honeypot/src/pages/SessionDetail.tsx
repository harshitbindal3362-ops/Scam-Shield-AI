import { Shell } from "@/components/layout/Shell";
import { CyberCard, CyberButton, CyberBadge } from "@/components/ui/cyber-ui";
import { useGetSession, useFinalizeSession } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { ShieldAlert, ArrowLeft, Send, CheckCircle2, User, Bot, Volume2 } from "lucide-react";
import { Link } from "wouter";
import { playVoice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

export function SessionDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: session, isLoading, error } = useGetSession(id || "");
  const finalizeMutation = useFinalizeSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.conversation]);

  if (!id) return null;

  const handleFinalize = async () => {
    try {
      await finalizeMutation.mutateAsync({ sessionId: id });
      toast({ title: "Session Finalized", description: "Intelligence reported to GUVI successfully.", variant: "default" });
      setLocation("/reports");
    } catch (e) {
      toast({ title: "Finalization Failed", description: "Could not report intelligence.", variant: "destructive" });
    }
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/sessions" className="inline-flex items-center gap-2 text-primary hover:text-primary-foreground hover:bg-primary px-3 py-1 font-mono text-sm transition-colors border border-transparent hover:border-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Sessions
        </Link>

        {isLoading ? (
          <div className="animate-pulse h-96 bg-card/50 border border-border" />
        ) : error || !session ? (
          <div className="p-6 border border-destructive text-destructive">Session not found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conversation View */}
            <div className="lg:col-span-2 flex flex-col h-[calc(100vh-200px)]">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-display">Target Engagement</h2>
                  <p className="text-muted-foreground font-mono text-sm">ID: {session.sessionId}</p>
                </div>
                <CyberBadge variant={session.scamDetected ? "destructive" : "default"}>
                  {Math.round(session.scamProbability * 100)}% SCAM PROBABILITY
                </CyberBadge>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto pr-4 space-y-6">
                {session.conversation?.map((turn, idx) => {
                  const isAgent = turn.role === 'assistant' || turn.role === 'agent';
                  return (
                    <div key={idx} className={cn("flex", isAgent ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] p-4 relative border",
                        isAgent ? "bg-primary/10 border-primary/30 text-primary-foreground" : "bg-card border-card-border text-foreground"
                      )}>
                        <div className="flex items-center justify-between mb-2 gap-4">
                          <span className={cn("text-xs font-bold font-mono uppercase flex items-center gap-2", isAgent ? "text-primary" : "text-muted-foreground")}>
                            {isAgent ? <Bot className="w-4 h-4"/> : <User className="w-4 h-4"/>}
                            {isAgent ? "Honeypot AI" : "Suspect"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{new Date(turn.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="font-sans whitespace-pre-wrap">{turn.content}</p>
                        
                        {isAgent && (
                          <button 
                            onClick={() => playVoice(turn.content)}
                            className="mt-3 text-xs flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
                            title="Play via OmniDimension"
                          >
                            <Volume2 className="w-4 h-4" /> Synthesize Voice
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <CyberButton className="w-full justify-center gap-2" variant="outline" onClick={() => toast({title: "Auto-Engage Mode Active", description: "Agent is automatically handling responses."})}>
                  <Send className="w-4 h-4" /> Force Agent Reply
                </CyberButton>
              </div>
            </div>

            {/* Intelligence Panel */}
            <div className="space-y-6">
              <CyberCard>
                <h3 className="text-xl font-bold font-display mb-4 flex items-center gap-2 text-primary">
                  <ShieldAlert className="w-5 h-5" /> Intelligence
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase text-muted-foreground mb-2">Extracted Bank Accs</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.extractedIntelligence?.bankAccounts?.length ? 
                        session.extractedIntelligence.bankAccounts.map((b,i) => <CyberBadge key={i} variant="destructive">{b}</CyberBadge>) 
                        : <span className="text-sm text-muted-foreground">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase text-muted-foreground mb-2">Phishing Links</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.extractedIntelligence?.phishingLinks?.length ? 
                        session.extractedIntelligence.phishingLinks.map((l,i) => <CyberBadge key={i} variant="destructive">{l}</CyberBadge>) 
                        : <span className="text-sm text-muted-foreground">None detected</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase text-muted-foreground mb-2">Phone Numbers</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.extractedIntelligence?.phoneNumbers?.length ? 
                        session.extractedIntelligence.phoneNumbers.map((p,i) => <CyberBadge key={i} variant="warning">{p}</CyberBadge>) 
                        : <span className="text-sm text-muted-foreground">None detected</span>}
                    </div>
                  </div>
                  
                  {session.agentNotes && (
                    <div className="mt-4 p-3 bg-white/5 border border-border text-sm font-mono text-muted-foreground">
                      <span className="text-primary block mb-1">Agent Notes:</span>
                      {session.agentNotes}
                    </div>
                  )}
                </div>
              </CyberCard>

              <CyberButton 
                variant="primary" 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleFinalize}
                disabled={finalizeMutation.isPending || session.status === 'complete'}
              >
                {finalizeMutation.isPending ? "Reporting..." : session.status === 'complete' ? "Already Reported" : "Finalize & Report Intel"}
                <CheckCircle2 className="w-5 h-5" />
              </CyberButton>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
