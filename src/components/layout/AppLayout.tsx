import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Home, Settings, Zap } from "lucide-react";
import { toast } from "sonner";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export const AppLayout = ({ children, title }: AppLayoutProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen">
      {/* Premium Glass Header with motion */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 glass-strong animate-header-enter">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-xl hover:bg-accent/10 hover:text-accent hover-icon-rotate"
            >
              <Home className="h-5 w-5 transition-transform duration-200" />
            </Button>
            {title && (
              <div className="flex items-center gap-2 animate-fade-in">
                <Zap className="h-5 w-5 text-primary animate-glow-pulse" />
                <h1 className="text-xl font-semibold font-display">{title}</h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="rounded-xl hover:bg-accent/10 hover:text-accent hover-icon-rotate"
            >
              <Settings className="h-5 w-5 transition-transform duration-200" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive hover-icon-rotate"
            >
              <LogOut className="h-5 w-5 transition-transform duration-200" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content with page animation */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8 animate-page-enter">
        {children}
      </main>
    </div>
  );
};
