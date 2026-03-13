import { Link, useLocation } from "wouter";
import { Activity, ShieldAlert, Database, PhoneCall, FileText, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { href: "/", label: "Live Monitor", icon: Activity },
  { href: "/sessions", label: "Active Sessions", icon: ShieldAlert },
  { href: "/intelligence", label: "Intelligence Board", icon: Database },
  { href: "/call-shield", label: "Call Shield", icon: PhoneCall },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="w-64 h-screen border-r border-border bg-card/50 backdrop-blur-xl flex flex-col relative z-10">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary cyber-glow-text" />
          <div>
            <h1 className="font-display font-bold text-xl text-foreground leading-none">HONEYPOT</h1>
            <p className="text-[10px] text-primary font-mono uppercase tracking-widest">AI Detection Grid</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-none font-display uppercase tracking-wide text-sm transition-all duration-200 border border-transparent",
                isActive 
                  ? "bg-primary/10 text-primary border-primary/30 cyber-glow" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-foreground transition-colors font-display uppercase text-sm"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
}
