import { Link, useLocation } from "wouter";
import { Activity, ShieldAlert, Database, PhoneCall, FileText, Sun, Moon, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

const navItems = [
  { href: "/", label: "Live Monitor", icon: Activity },
  { href: "/sessions", label: "Sessions", icon: ShieldAlert },
  { href: "/intelligence", label: "Intelligence", icon: Database },
  { href: "/call-shield", label: "Call Shield", icon: PhoneCall },
  { href: "/reports", label: "Reports", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="w-56 h-screen border-r border-border bg-card flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground leading-none">Honeypot AI</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Scam Detection</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}>
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDark ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </div>
  );
}
