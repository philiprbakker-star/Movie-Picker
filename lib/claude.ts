import Anthropic from "@anthropic-ai/sdk";
import type { Suggestion, SuggestionRequest, Title } from "./types";
import { PLATFORM_LABELS } from "./types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SUGGESTIONS_TOOL = {
  name: "provide_suggestions",
  description: "Return a short list of movie/series suggestions from the given catalog.",
  input_schema: {
    type: "object" as const,
    properties: {
      suggestions: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            title: { type: "string" as const },
            type: { type: "string" as const, enum: ["movie", "series"] },
            platform: { type: "string" as const },
            reason: { type: "string" as const },
          },
          required: ["title", "type", "platform", "reason"],
        },
      },
    },
    required: ["suggestions"],
  },
};

function catalogToPrompt(catalog: Title[]): string {
  return catalog
    .map((t) => {
      const platforms = t.platforms.map((p) => PLATFORM_LABELS[p]).join(", ");
      return `- "${t.title}" (${t.type}, ${t.year ?? "?"}) | IMDb ${t.imdbRating ?? "?"} | ${t.runtimeMinutes ?? "?"} min | genres: ${t.genres.join(", ")} | on: ${platforms}`;
    })
    .join("\n");
}

export async function getSuggestions(
  request: SuggestionRequest,
  catalog: Title[]
): Promise<Suggestion[]> {
  const message = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    system:
      "You are a streaming recommendation assistant. You choose ONLY titles from the given catalog " +
      "(never anything outside it) and give a short, concrete reason per suggestion that matches the user's answers.",
    tools: [SUGGESTIONS_TOOL],
    tool_choice: { type: "tool", name: "provide_suggestions" },
    messages: [
      {
        role: "user",
        content:
          `Available catalog:\n${catalogToPrompt(catalog)}\n\n` +
          `My preferences:\n` +
          `- Mood: ${request.mood}\n` +
          `- Genre: ${request.genrePreference}\n` +
          `- Time available: ${request.timeAvailable}\n` +
          `- Watching with: ${request.watchingWith}\n\n` +
          `Give 3 to 5 suggestions from the catalog above.`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") return [];

  const input = toolUse.input as { suggestions: Suggestion[] };
  return input.suggestions ?? [];
}
