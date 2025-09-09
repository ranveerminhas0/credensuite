import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Dashboard from "@/pages/dashboard";
import GenerateCards from "@/pages/generate-cards";
import Members from "@/pages/members";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { auth } from "@/lib/auth";
import { useEffect, useState } from "react";

function ProtectedRoutes() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [location, navigate] = useLocation();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setIsAuthed(!!user);
      if (!user && location !== "/login") {
        navigate("/login");
      }
    });
    return () => unsub();
  }, [location, navigate]);

  if (isAuthed === null) return null;

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/generate" component={GenerateCards} />
      <Route path="/members" component={Members} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <Route>
            <div className="flex min-h-screen bg-background overflow-x-hidden">
              <div className="flex-1">
                <Header />
                <main className="p-6">
                  <ProtectedRoutes />
                </main>
              </div>
            </div>
          </Route>
        </Switch>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
