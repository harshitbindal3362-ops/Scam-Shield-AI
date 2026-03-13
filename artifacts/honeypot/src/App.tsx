import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Dashboard } from "@/pages/Dashboard";
import { Sessions } from "@/pages/Sessions";
import { SessionDetail } from "@/pages/SessionDetail";
import { Intelligence } from "@/pages/Intelligence";
import { CallShield } from "@/pages/CallShield";
import { Reports } from "@/pages/Reports";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/sessions" component={Sessions} />
      <Route path="/sessions/:id" component={SessionDetail} />
      <Route path="/intelligence" component={Intelligence} />
      <Route path="/call-shield" component={CallShield} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
