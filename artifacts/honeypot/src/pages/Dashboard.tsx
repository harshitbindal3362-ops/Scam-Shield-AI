import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Activity, AlertTriangle, ShieldCheck, Send, ChevronRight, Zap, Clock, Eye } from "lucide-react";
import { useAnalyzeMessage, useListSessions } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";

const ATTACK_STEPS = [
  {
    phase: "Initial Contact",
    attacker: "SMS received from +91-XXXXXXXX",
    message: "Dear Customer, your SBI account has been flagged. Immediate KYC verification required to avoid suspension. Click: http://sbi-verify-kyc.xyz",
    action: "Victim sees the message and panics — it looks official.",
    collected: null,
  },
  {
    phase: "Fake Portal",
    attacker: "Victim clicks the link",
    message: "Website opens: 'SBI KYC Portal' with official-looking logo and form asking for: Name, Account Number, Date of Birth, Registered Mobile.",
    action: "Victim fills in all details — thinking it's the bank's website.",
    collected: "Name + Account Number + DOB + Mobile",
  },
  {
    phase: "OTP Harvest",
    attacker: "Portal asks for OTP",
    message: "\"We've sent an OTP to your registered mobile. Please enter it below to complete verification.\" (OTP was actually triggered by the scammer logging into real bank portal)",
    action: "Victim enters OTP — giving the scammer full account access.",
    collected: "OTP (one-time bypass)",
  },
  {
    phase: "Money Transfer",
    attacker: "Account compromised",
    message: "Scammer initiates transfer of ₹2,40,000 from victim's account to mule account: 9876543210@ybl",
    action: "Victim still on fake KYC page, unaware. Receives debit SMS moments later.",
    collected: "₹2,40,000 transferred",
  },
  {
    phase: "Trail Goes Cold",
    attacker: "Scammer disappears",
    message: "Website goes offline. Phone number unreachable. Money moved through 3 mule accounts in 8 minutes.",
    action: "Victim realises fraud. By the time FIR is filed, money is gone.",
    collected: null,
  },
];

export function Dashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("Your bank account will be blocked today. Click here to verify: http://fake-bank.xyz. Call +919876543210 now. Transfer ₹1 to verify: scammer@ybl");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAttack, setShowAttack] = useState(false);
  const [attackStep, setAttackStep] = useState(-1);
  const [isRunningAttack, setIsRunningAttack] = useState(false);

  const analyzeMutation = useAnalyzeMessage();
  const { data: sessions } = useListSessions();

  const recentSessions = (sessions || []).slice(-5).reverse();

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    try {
      const result = await analyzeMutation.mutateAsync({
        data: {
          sessionId: `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          message: { sender: "Unknown", text: message, timestamp: new Date().toISOString() },
          metadata: { channel: "SMS", language: "English", locale: "IN" },
        },
      });
      setAnalysisResult(result);
      if (result.scamDetected) {
        toast({ title: "Threat Detected", description: `${result.scamType} — Agent deployed.`, variant: "destructive" });
      }
    } catch {
      toast({ title: "Analysis Failed", description: "Could not reach the AI engine.", variant: "destructive" });
    }
  };

  const runAttackSimulation = async () => {
    setShowAttack(true);
    setIsRunningAttack(true);
    setAttackStep(-1);
    for (let i = 0; i < ATTACK_STEPS.length; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 600 : 2200));
      setAttackStep(i);
    }
    setIsRunningAttack(false);
  };

  return (
    <Shell>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Live Monitor</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time scam detection and agent engagement</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Online
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" />
                <h2 className="font-medium text-sm">Analyze Message</h2>
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="w-full bg-background border border-border rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                placeholder="Paste suspicious message here..."
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-md transition-colors disabled:opacity-60"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <><Send className="w-4 h-4" /> Analyze Signal</>
                )}
              </button>
            </div>

            <button
              onClick={runAttackSimulation}
              disabled={isRunningAttack}
              className="w-full flex items-center justify-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 text-sm font-medium px-4 py-2.5 rounded-md transition-colors"
            >
              <Zap className="w-4 h-4" />
              {isRunningAttack ? "Simulating Attack..." : "Simulate Phishing Attack"}
            </button>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-3">
            {analyzeMutation.isPending ? (
              <div className="h-full min-h-[240px] bg-card border border-border rounded-lg flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm">Scanning threat vectors...</p>
              </div>
            ) : analysisResult ? (
              <div className={cn(
                "bg-card border rounded-lg p-5 space-y-4",
                analysisResult.scamDetected ? "border-red-500/40" : "border-emerald-500/30"
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {analysisResult.scamDetected ? (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className={cn("font-semibold text-sm", analysisResult.scamDetected ? "text-red-400" : "text-emerald-400")}>
                      {analysisResult.scamDetected ? "Threat Detected" : "Signal Clean"}
                    </span>
                    {analysisResult.scamType && analysisResult.scamType !== "None" && (
                      <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">
                        {analysisResult.scamType}
                      </span>
                    )}
                  </div>
                  <span className={cn("text-2xl font-bold font-mono", analysisResult.scamDetected ? "text-red-400" : "text-emerald-400")}>
                    {analysisResult.scamProbability}%
                  </span>
                </div>

                {/* Extracted intel */}
                <div className="space-y-2">
                  {analysisResult.extractedIntelligence?.phishingLinks?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Phishing Links</p>
                      {analysisResult.extractedIntelligence.phishingLinks.map((l: string) => (
                        <div key={l} className="text-xs font-mono bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 truncate">{l}</div>
                      ))}
                    </div>
                  )}
                  {analysisResult.extractedIntelligence?.upiIds?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">UPI IDs</p>
                      {analysisResult.extractedIntelligence.upiIds.map((u: string) => (
                        <div key={u} className="text-xs font-mono bg-orange-500/10 text-orange-400 px-2 py-1 rounded border border-orange-500/20">{u}</div>
                      ))}
                    </div>
                  )}
                  {analysisResult.extractedIntelligence?.phoneNumbers?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Phone Numbers</p>
                      {analysisResult.extractedIntelligence.phoneNumbers.map((p: string) => (
                        <div key={p} className="text-xs font-mono bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20">{p}</div>
                      ))}
                    </div>
                  )}
                </div>

                {analysisResult.scamDetected && (
                  <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                    <p className="text-xs text-primary font-medium mb-1">Agent Response</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">"{analysisResult.agentReply?.slice(0, 200)}{analysisResult.agentReply?.length > 200 ? "..." : ""}"</p>
                  </div>
                )}

                <button
                  onClick={() => setLocation(`/sessions/${analysisResult.sessionId}`)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> View full session details
                </button>
              </div>
            ) : (
              <div className="h-full min-h-[240px] bg-card border border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Activity className="w-8 h-8 opacity-30" />
                <p className="text-sm">Waiting for signal input...</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Intercepts */}
        {recentSessions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-sm text-foreground">Recent Intercepts</h2>
              <Link href="/sessions" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {recentSessions.map(session => (
                <Link key={session.sessionId} href={`/sessions/${session.sessionId}`}>
                  <div className="bg-card border border-border hover:border-primary/40 rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full flex-shrink-0",
                        session.scamDetected ? "bg-red-500" : "bg-emerald-500"
                      )} />
                      <span className="text-sm font-mono text-muted-foreground truncate">{session.sessionId}</span>
                      {session.scamType && (
                        <span className="text-xs bg-card border border-border px-2 py-0.5 rounded text-muted-foreground hidden sm:block">{session.scamType}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className={cn("text-sm font-semibold", session.scamDetected ? "text-red-400" : "text-emerald-400")}>
                        {session.scamProbability}%
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(new Date(session.startedAt), "HH:mm")}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Attack Simulation */}
        {showAttack && (
          <div className="bg-card border border-orange-500/30 rounded-lg p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <h2 className="font-semibold text-sm text-orange-400">Phishing Attack Simulation</h2>
                <span className="text-xs text-muted-foreground">— How scammers steal your money</span>
              </div>
              <button onClick={() => { setShowAttack(false); setAttackStep(-1); }} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="space-y-3">
              {ATTACK_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={cn(
                    "border rounded-lg p-4 transition-all duration-500",
                    i <= attackStep ? "border-orange-500/40 bg-orange-500/5 opacity-100" : "border-border bg-background/50 opacity-30"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full border",
                      i < attackStep ? "bg-red-500/20 text-red-400 border-red-500/30" :
                      i === attackStep ? "bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse" :
                      "bg-muted text-muted-foreground border-border"
                    )}>
                      Step {i + 1}
                    </span>
                    <span className="text-sm font-medium">{step.phase}</span>
                  </div>
                  {i <= attackStep && (
                    <>
                      <div className="text-xs text-muted-foreground mb-1 font-medium">{step.attacker}</div>
                      <p className="text-sm text-foreground/80 bg-background/60 border border-border rounded p-2 font-mono leading-relaxed">{step.message}</p>
                      <p className="text-xs text-muted-foreground mt-2 italic">{step.action}</p>
                      {step.collected && (
                        <div className="mt-2 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                          <span className="text-xs text-red-400 font-medium">Collected: {step.collected}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            {attackStep === ATTACK_STEPS.length - 1 && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm font-semibold text-red-400 mb-1">This is why Honeypot AI matters</p>
                <p className="text-xs text-muted-foreground">Our AI agent intercepts scammers before they reach real victims — extracting their identity, bank details, and phishing infrastructure for law enforcement.</p>
                <button
                  onClick={() => { setShowAttack(false); setAttackStep(-1); }}
                  className="mt-3 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded hover:bg-primary/90 transition-colors"
                >
                  Try Real Analysis Above →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
