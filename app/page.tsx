"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

type Status = "idle" | "loading" | "done" | "error";

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
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

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            🥕 PantryPilot
          </h1>
          <p className="mt-2 max-w-md text-zinc-600 dark:text-zinc-400">
            Photograph your fridge or pantry. An AI vision pipeline spots what
            you have, then an AI chef suggests what to cook tonight — plus a
            shopping list for what&apos;s missing.
          </p>
        </div>

        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-white p-10 text-center transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Uploaded pantry"
              className="max-h-64 rounded-lg object-contain"
            />
          ) : (
            <>
              <span className="text-4xl">📷</span>
              <p className="font-medium text-zinc-700 dark:text-zinc-300">
                Drop a photo here, or click to choose one
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {status === "loading" && (
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
            Looking at your ingredients and dreaming up dinner…
          </div>
        )}

        {status === "error" && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {status === "done" && (
          <article className="prose prose-zinc dark:prose-invert w-full max-w-none rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <ReactMarkdown>{result}</ReactMarkdown>
          </article>
        )}

        <footer className="mt-8 text-center text-xs text-zinc-400">
          Built on{" "}
          <a
            href="https://rocketride.ai"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            RocketRide
          </a>{" "}
          — vision + agent pipeline running on RocketRide Cloud.
        </footer>
      </main>
    </div>
  );
}
