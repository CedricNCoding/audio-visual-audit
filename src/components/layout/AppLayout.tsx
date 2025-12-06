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
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 glass-strong">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="rounded-xl hover:bg-accent/10 hover:text-accent"
            >
              <Home className="h-5 w-5" />
            </Button>
            {title && (
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold font-display">{title}</h1>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="rounded-xl hover:bg-accent/10 hover:text-accent"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};
