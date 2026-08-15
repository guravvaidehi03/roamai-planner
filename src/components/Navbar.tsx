import { Link, useRouter } from "@tanstack/react-router";
import { Compass, LogOut, Map, PlusCircle, Sparkles, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { CurrencyToggle } from "@/components/CurrencyToggle";

type Props = { authed?: boolean };

export function Navbar({ authed = false }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!authed) return;
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, [authed]);

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-full glass-strong px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Roam<span className="text-gradient">AI</span>
          </span>
        </Link>

        {authed ? (
          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/dashboard" icon={<Compass className="h-4 w-4" />} label="Explore" />
            <NavItem to="/create-trip" icon={<PlusCircle className="h-4 w-4" />} label="Plan" />
            <NavItem to="/saved" icon={<Map className="h-4 w-4" />} label="Trips" />
            <NavItem to="/profile" icon={<User className="h-4 w-4" />} label="Profile" />
          </nav>
        ) : (
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#destinations" className="hover:text-foreground">Destinations</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#reviews" className="hover:text-foreground">Reviews</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <CurrencyToggle />
        {authed ? (
          <button
            onClick={signOut}
            title={email ?? ""}
            className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-sm hover:bg-secondary"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        ) : (
          <Link
            to="/auth"
            className="rounded-full gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
          >
            Get Started
          </Link>
        )}
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground [&.active]:bg-secondary [&.active]:text-foreground"
      activeProps={{ className: "active" }}
    >
      {icon}
      {label}
    </Link>
  );
}
