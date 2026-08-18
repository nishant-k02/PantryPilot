import { ArrowUpRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-base">🥕</span>
              PantryPilot
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Turns a photo of your fridge or pantry into real recipes and a
              shopping list, using a vision + agent AI pipeline.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold">Built with RocketRide</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              PantryPilot&apos;s AI pipeline — image vision, LLM reasoning, and
              orchestration — runs entirely on{" "}
              <a
                href="https://rocketride.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-foreground hover:underline"
              >
                RocketRide Cloud
                <ArrowUpRight className="h-3 w-3" />
              </a>
              , an open-source AI pipeline platform.
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} PantryPilot</p>
          <p>
            Built by{" "}
            <a
              href="https://nishant-khandhar-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              Nishant Khandhar
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
