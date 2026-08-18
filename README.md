# 🥕 PantryPilot

Photograph your fridge or pantry. An AI vision pipeline identifies what's in
the shot, then an AI chef suggests real, cookable recipes for tonight — plus
a shopping list for what's missing.

**Live app:** [pantrypilot-pi.vercel.app](https://pantrypilot-pi.vercel.app)

## What it does

1. You drop in (or drag-and-drop) a photo of your fridge, pantry, or counter.
2. A vision model reads the photo and lists the specific ingredients it sees.
3. An LLM takes that ingredient list and writes three real recipes you could
   cook tonight, using what you already have, plus a short shopping list of
   a few extra ingredients that would unlock better meals.
4. Everything renders back as clean, readable Markdown — recipes, steps, and
   a proper shopping-list table.

## How it's built

The entire AI layer — vision analysis, prompt assembly, and recipe
generation — runs as a single pipeline on [RocketRide Cloud](https://rocketride.ai),
an open-source AI pipeline platform. The Next.js app is a thin client: it
uploads the photo, asks the pipeline a question, and renders the answer.

```
Photo upload
     │
     ▼
┌─────────────┐     ┌──────────────────┐     ┌───────────┐     ┌─────────────┐
│   Webhook   │ ──▶ │  Gemini Vision    │ ──▶ │  Prompt   │ ──▶ │  Claude     │
│  (intake)   │     │ (ingredient spot) │     │ (merge)   │     │  (recipes)  │
└─────────────┘     └──────────────────┘     └───────────┘     └─────────────┘
                                                                        │
                                                                        ▼
                                                                  Markdown result
```

The pipeline definition lives in [`pipeline/pantrypilot.pipe.json`](pipeline/pantrypilot.pipe.json)
and is submitted to RocketRide Cloud at request time via the
[RocketRide TypeScript SDK](https://www.npmjs.com/package/rocketride)
(see [`lib/rocketride.ts`](lib/rocketride.ts)).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| UI | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| AI orchestration | [RocketRide Cloud](https://rocketride.ai) |
| Vision model | Gemini (via RocketRide's `image_vision_gemini` node) |
| Language model | Claude (via RocketRide's `llm_anthropic` node) |
| Hosting | [Vercel](https://vercel.com) |

## Getting started

```bash
git clone https://github.com/nishant-k02/pantrypilot.git
cd pantrypilot
npm install
```

Create a `.env.local` file (see [`.env.local.example`](.env.local.example)):

```bash
ROCKETRIDE_URI=https://api.rocketride.ai
ROCKETRIDE_AUTH=your-rocketride-api-token

# Vision step (image_vision_gemini node)
GEMINI_API_KEY=your-gemini-api-key

# Recipe-writing step (llm_anthropic node)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

Then run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and drop in a photo.

## Project structure

```
app/
  page.tsx              # Upload UI, result rendering
  api/analyze/route.ts  # Receives the photo, calls the RocketRide pipeline
components/
  navbar.tsx, footer.tsx
  ui/                    # shadcn/ui primitives
lib/
  rocketride.ts          # RocketRide SDK integration + pipeline substitution
pipeline/
  pantrypilot.pipe.json  # The RocketRide pipeline definition
```

## Deployment

The app is deployed on Vercel, connected to this repository's `main` branch
for automatic deploys. The four environment variables above are configured
as Vercel project environment variables (never committed to the repo).

## Author

Built by [Nishant Khandhar](https://nishant-khandhar-portfolio.vercel.app/).
