import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { CyberCard, CyberButton } from "@/components/ui/cyber-ui";
import { PhoneCall, Shield, PhoneOff, Mic, Volume2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playVoice, cn } from "@/lib/utils";

export function CallShield() {
  const [isActive, setIsActive] = useState(false);
  const [callState, setCallState] = useState<"idle" | "incoming" | "active" | "analyzing" | "verdict">("idle");
  const [transcript, setTranscript] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<{scam: boolean, reason: string} | null>(null);

  // Simulated Call Sequence
  useEffect(() => {
    if (callState === "incoming") {
      const t = setTimeout(() => setCallState("active"), 3000);
      return () => clearTimeout(t);
    }
    if (callState === "active") {
      const seq = async () => {
        await new Promise(r => setTimeout(r, 1000));
        setTranscript(p => [...p, "Caller: Hello, this is Amit from your bank."]);
        await new Promise(r => setTimeout(r, 2000));
        setTranscript(p => [...p, "Caller: Your debit card is blocked due to unusual activity."]);
        await new Promise(r => setTimeout(r, 2000));
        setTranscript(p => [...p, "AI Agent: Oh no! How do I unblock it?"]);
        playVoice("Oh no! How do I unblock it?");
        await new Promise(r => setTimeout(r, 2500));
        setTranscript(p => [...p, "Caller: Please share the 16 digit number on the card immediately."]);
        
        setCallState("analyzing");
        await new Promise(r => setTimeout(r, 2000));
        
        setVerdict({
          scam: true,
          reason: "Urgency tactic + request for sensitive card details."
        });
        setCallState("verdict");
      };
      seq();
    }
  }, [callState]);

  const reset = () => {
    setCallState("idle");
    setTranscript([]);
    setVerdict(null);
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <PhoneCall className="w-8 h-8 text-primary" />
              Call Shield
            </h2>
            <p className="text-muted-foreground mt-2">Real-time voice interception and analysis</p>
          </div>
          
          <div className="flex items-center gap-4 border border-border bg-card p-2">
            <span className="text-sm font-display uppercase tracking-wider font-bold">Active Protection</span>
            <button 
              onClick={() => { setIsActive(!isActive); reset(); }}
              className={cn("w-14 h-8 relative transition-colors duration-300", isActive ? "bg-primary" : "bg-muted")}
            >
              <motion.div 
                className="w-6 h-6 bg-white absolute top-1"
                animate={{ left: isActive ? "30px" : "4px" }}
              />
            </button>
          </div>
        </header>

        {!isActive ? (
          <CyberCard className="text-center py-20 opacity-50">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Shield Offline</h3>
            <p>Toggle Active Protection to intercept calls.</p>
          </CyberCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <CyberCard className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <AnimatePresence mode="wait">
                {callState === "idle" && (
                  <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <PhoneCall className="w-16 h-16 text-primary mx-auto mb-6 opacity-20" />
                    <p className="text-muted-foreground mb-8">Listening for incoming vectors...</p>
                    <CyberButton onClick={() => setCallState("incoming")}>Simulate Incoming Call</CyberButton>
                  </motion.div>
                )}
                
                {callState === "incoming" && (
                  <motion.div key="incoming" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <PhoneCall className="w-20 h-20 text-warning mx-auto mb-6 animate-bounce" />
                    <h3 className="text-2xl font-bold text-warning animate-pulse">UNKNOWN CALLER</h3>
                    <p className="text-muted-foreground mt-2 font-mono">+91 98765 43210</p>
                  </motion.div>
                )}

                {callState === "active" && (
                  <motion.div key="active" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="w-full">
                    <div className="flex items-center justify-center gap-4 mb-8">
                      <Mic className="w-8 h-8 text-primary animate-pulse" />
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <motion.div 
                            key={i} 
                            className="w-2 bg-primary" 
                            animate={{ height: ["10px", "40px", "10px"] }} 
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                      <Volume2 className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-primary font-mono font-bold">INTERCEPTING AUDIO...</p>
                  </motion.div>
                )}

                {callState === "analyzing" && (
                  <motion.div key="analyzing" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                    <div className="w-16 h-16 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="font-mono tracking-widest text-primary">ANALYZING INTENT</p>
                  </motion.div>
                )}

                {callState === "verdict" && verdict && (
                  <motion.div key="verdict" initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}}>
                    {verdict.scam ? (
                      <>
                        <AlertTriangle className="w-20 h-20 text-destructive mx-auto mb-4" />
                        <h3 className="text-3xl font-bold text-destructive mb-2 uppercase">Scam Detected</h3>
                        <p className="text-sm text-muted-foreground px-4">{verdict.reason}</p>
                        <CyberButton variant="destructive" className="mt-8" onClick={reset}><PhoneOff className="w-4 h-4 mr-2"/> Drop Call</CyberButton>
                      </>
                    ) : (
                      <>
                        <Shield className="w-20 h-20 text-success mx-auto mb-4" />
                        <h3 className="text-3xl font-bold text-success mb-2 uppercase">Legitimate</h3>
                        <CyberButton variant="primary" className="mt-8" onClick={reset}>End Call</CyberButton>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CyberCard>

            <CyberCard className="flex flex-col h-[400px]">
              <h3 className="text-lg font-bold border-b border-border pb-4 mb-4">Live Transcript</h3>
              <div className="flex-1 overflow-y-auto font-mono text-sm space-y-4">
                {transcript.length === 0 && <p className="text-muted-foreground italic">Waiting for audio stream...</p>}
                {transcript.map((line, i) => (
                  <div key={i} className={cn("p-2 border-l-2", line.startsWith("AI") ? "border-primary bg-primary/5 text-primary-foreground" : "border-warning bg-warning/5 text-foreground")}>
                    {line}
                  </div>
                ))}
              </div>
            </CyberCard>
          </div>
        )}
      </div>
    </Shell>
  );
}
