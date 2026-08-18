import { readFile } from "fs/promises";
import path from "path";
import { RocketRideClient, Question, type PIPELINE_RESULT } from "rocketride";

const PIPELINE_PATH = path.join(process.cwd(), "pipeline", "pantrypilot.pipe.json");

/**
 * Loads the pipeline template and substitutes `${VAR_NAME}` placeholders with
 * real values from process.env. Done here (not via the SDK's `use({ env })`,
 * which only merges ROCKETRIDE_*-prefixed overrides) so the fully-resolved
 * config — including provider API keys — is what actually reaches the engine.
 */
async function loadPipeline(): Promise<Record<string, unknown>> {
  const raw = await readFile(PIPELINE_PATH, "utf-8");
  const resolved = raw.replace(/\$\{(\w+)\}/g, (match, name: string) => {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  });
  return JSON.parse(resolved);
}

/**
 * Runs the PantryPilot pipeline against a single uploaded photo and returns
 * the markdown recipe/shopping-list response.
 */
export async function analyzePantryPhoto(file: File): Promise<string> {
  const auth = process.env.ROCKETRIDE_AUTH;
  const uri = process.env.ROCKETRIDE_URI ?? "https://api.rocketride.ai";
  if (!auth) {
    throw new Error("ROCKETRIDE_AUTH is not set. Add it to .env.local.");
  }

  const pipeline = await loadPipeline();

  return RocketRideClient.withConnection(
    { auth, uri },
    async (client) => {
      const { token } = await client.use({
        pipeline: pipeline as never,
        name: "pantrypilot-analyze",
      });

      await client.sendFiles([{ file, objinfo: { name: file.name } }], token);

      const question = new Question();
      question.addQuestion("Suggest recipes and a shopping list for what's in this photo.");
      const result = await client.chat({ token, question });

      await client.terminate(token);

      const answer = extractAnswer(result);
      if (!answer) {
        throw new Error("PantryPilot pipeline returned no result.");
      }
      return answer;
    },
  );
}

/**
 * PIPELINE_RESULT carries dynamic fields described by `result_types`
 * (e.g. `{ answers: "answers" }` -> read `result.answers`, a string[]).
 * Prefer an "answers" field, then "text", then scan for any string[] field.
 *
 * The Prompt node can flush more than one merged answer if it closes before
 * every input lane has settled (e.g. the vision result arrives just after
 * the text lane closes once already). When that happens `answers` holds
 * multiple entries in emission order — the last one reflects the fully
 * merged context, so take that rather than concatenating all of them.
 */
function extractAnswer(result: PIPELINE_RESULT | undefined): string | undefined {
  if (!result) return undefined;

  const fieldByType = result.result_types ?? {};
  const preferredField =
    Object.keys(fieldByType).find((key) => fieldByType[key] === "answers") ??
    Object.keys(fieldByType).find((key) => fieldByType[key] === "text");

  const candidates = [
    preferredField ? result[preferredField] : undefined,
    result.answers,
    result.text,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (Array.isArray(candidate) && candidate.length > 0) {
      return candidate[candidate.length - 1];
    }
  }
  return undefined;
}
