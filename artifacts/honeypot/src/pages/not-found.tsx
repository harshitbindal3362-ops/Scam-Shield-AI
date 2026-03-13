import { Shell } from "@/components/layout/Shell";
import { CyberCard, CyberButton } from "@/components/ui/cyber-ui";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Shell>
      <div className="flex items-center justify-center min-h-[70vh]">
        <CyberCard className="max-w-md text-center py-12">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground font-mono mb-8">SECTOR NOT FOUND IN GRID</p>
          <Link href="/">
            <CyberButton>Return to Monitor</CyberButton>
          </Link>
        </CyberCard>
      </div>
    </Shell>
  );
}
