import Link from "next/link";
import { Code2 } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <span className="text-lg">🥕</span>
          PantryPilot
        </Link>
        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <a
            href="https://github.com/nishant-k02/pantrypilot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Code2 className="h-4 w-4" />
            <span className="hidden sm:inline">Source</span>
          </a>
          <a
            href="https://rocketride.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            RocketRide
          </a>
        </nav>
      </div>
    </header>
  );
}
