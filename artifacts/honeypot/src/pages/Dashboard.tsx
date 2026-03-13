import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { CyberCard, CyberButton, CyberInput, CyberBadge } from "@/components/ui/cyber-ui";
import { Activity, ScanLine, AlertTriangle, ShieldCheck, Send } from "lucide-react";
import { useAnalyzeMessage } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function Dashboard() {
  const { toast } = useToast();
  const [message, setMessage] = useState("Your bank account will be blocked today. Click here to verify: http://fake-bank.xyz. Call +919876543210 now.");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeMutation = useAnalyzeMessage();

  const handleAnalyze = async () => {
    if (!message) return;
    
    try {
      const result = await analyzeMutation.mutateAsync({
        data: {
          sessionId: `sim-${Math.random().toString(36).substring(7)}`,
          message: {
            sender: "Unknown",
            text: message,
            timestamp: new Date().toISOString()
          },
          metadata: { channel: "SMS", language: "English", locale: "IN" }
        }
      });
      setAnalysisResult(result);
      if (result.scamDetected) {
         toast({ title: "Threat Detected", description: "Scam probability is high. Agent deployed.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Analysis Failed", description: "Could not connect to AI engine.", variant: "destructive" });
    }
  };

  return (
    <Shell>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Live Monitor
            </h2>
            <p className="text-muted-foreground mt-2">Real-time scam detection engine</p>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono text-primary bg-primary/10 px-4 py-2 border border-primary/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            SYSTEM ONLINE
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Injection Panel */}
          <CyberCard className="lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <ScanLine className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold">Inject Signal</h3>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground uppercase">Incoming Payload</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 bg-background/50 border border-border p-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                  placeholder="Paste suspicious message here..."
                />
              </div>
              <CyberButton 
                className="w-full flex items-center justify-center gap-2"
                onClick={handleAnalyze}
                disabled={analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? "Scanning..." : "Analyze Signal"}
                <Send className="w-4 h-4" />
              </CyberButton>
            </div>
          </CyberCard>

          {/* Analysis Results Panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {analyzeMutation.isPending ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[300px] flex flex-col items-center justify-center border border-primary/20 bg-primary/5 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,200,255,0.05)_50%)] bg-[length:100%_4px]" />
                  <ScanLine className="w-16 h-16 text-primary animate-pulse mb-4" />
                  <p className="font-mono text-primary tracking-widest animate-pulse">ANALYZING THREAT VECTORS...</p>
                </motion.div>
              ) : analysisResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <CyberCard className={cn(
                    "border-t-4",
                    analysisResult.scamDetected ? "border-t-destructive" : "border-t-success"
                  )}>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold flex items-center gap-3">
                          {analysisResult.scamDetected ? (
                            <><AlertTriangle className="w-7 h-7 text-destructive" /> <span className="text-destructive">THREAT DETECTED</span></>
                          ) : (
                            <><ShieldCheck className="w-7 h-7 text-success" /> <span className="text-success">SIGNAL CLEAN</span></>
                          )}
                        </h3>
                        <p className="text-muted-foreground mt-1 font-mono text-sm">Session ID: {analysisResult.sessionId}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold font-mono">
                          {Math.round(analysisResult.scamProbability * 100)}%
                        </div>
                        <p className="text-xs text-muted-foreground uppercase">Probability</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2 uppercase font-bold">Extracted Intelligence</p>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.extractedIntelligence?.phishingLinks?.map((link: string) => (
                            <CyberBadge key={link} variant="destructive">Link: {link}</CyberBadge>
                          ))}
                          {analysisResult.extractedIntelligence?.phoneNumbers?.map((num: string) => (
                            <CyberBadge key={num} variant="warning">Phone: {num}</CyberBadge>
                          ))}
                          {analysisResult.extractedIntelligence?.bankAccounts?.map((acc: string) => (
                            <CyberBadge key={acc} variant="destructive">Bank: {acc}</CyberBadge>
                          ))}
                          {analysisResult.extractedIntelligence?.suspiciousKeywords?.map((kw: string) => (
                            <CyberBadge key={kw} variant="default">Key: {kw}</CyberBadge>
                          ))}
                        </div>
                      </div>

                      {analysisResult.scamDetected && (
                        <div className="mt-6 p-4 bg-primary/10 border border-primary/30">
                          <p className="text-xs text-primary font-bold uppercase mb-2">Agent Response Generated</p>
                          <p className="font-mono text-sm text-foreground">"{analysisResult.agentReply}"</p>
                        </div>
                      )}
                    </div>
                  </CyberCard>
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[300px] flex flex-col items-center justify-center border border-dashed border-border"
                >
                  <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground font-mono">WAITING FOR INCOMING SIGNAL...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Shell>
  );
}
