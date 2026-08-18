"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertCircle, Camera, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setStatus("loading");
    setError("");
    setResult("");

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setResult(data.markdown);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function reset() {
    setPreview(null);
    setStatus("idle");
    setResult("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const isBusy = status === "loading";

  return (
    <div className="relative min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[50rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-screen max-w-2xl flex-col items-center gap-8 px-6 py-16 sm:py-24">
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          >
            <Sparkles className="h-3 w-3" />
            Powered by RocketRide Cloud
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            🥕 PantryPilot
          </h1>
          <p className="max-w-md text-balance text-muted-foreground">
            Photograph your fridge or pantry. Vision AI spots what you have,
            then an AI chef suggests what to cook tonight — plus a shopping
            list for what&apos;s missing.
          </p>
        </div>

        <Card
          onClick={() => !isBusy && fileInputRef.current?.click()}
          onDrop={isBusy ? undefined : onDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isBusy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "w-full overflow-hidden border-2 border-dashed py-0 transition-colors",
            isBusy ? "cursor-default opacity-70" : "cursor-pointer hover:border-primary/50",
            isDragging && "border-primary bg-primary/5",
          )}
        >
          <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Uploaded pantry"
                className="max-h-64 rounded-lg object-contain shadow-sm"
              />
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Drop a photo here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to choose one
                  </p>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isBusy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </CardContent>
        </Card>

        {status === "loading" && (
          <Card className="w-full">
            <CardContent className="flex items-center gap-3 p-5">
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium">
                  Looking at your ingredients and dreaming up dinner…
                </p>
                <p className="text-xs text-muted-foreground">
                  This can take up to a couple of minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "error" && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === "done" && (
          <div className="flex w-full flex-col gap-4">
            <Card>
              <CardContent className="p-6 sm:p-8">
                <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-relaxed prose-table:text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result}
                  </ReactMarkdown>
                </article>
              </CardContent>
            </Card>
            <Button variant="outline" className="w-full gap-2" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Try another photo
            </Button>
          </div>
        )}

        <p className="mt-auto pt-8 text-center text-xs text-muted-foreground">
          Built on{" "}
          <a
            href="https://rocketride.ai"
            className="underline underline-offset-2 hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            RocketRide
          </a>{" "}
          — vision + agent pipeline running on RocketRide Cloud.
        </p>
      </main>
    </div>
  );
}
