"use client";

import { useState } from "react";
import type { Suggestion, SuggestionRequest } from "@/lib/types";

const MOODS = ["Ontspannen", "Spannend", "Grappig", "Ontroerend", "Actievol"];
const GENRES = ["Geen voorkeur", "Actie", "Comedy", "Drama", "Sci-Fi", "Thriller", "Documentaire"];
const TIMES = ["< 30 min", "30-60 min", "1-2 uur", "2+ uur"];
const WITH = ["Alleen", "Partner", "Vrienden", "Familie / kinderen"];

export default function SuggestionsPage() {
  const [answers, setAnswers] = useState<SuggestionRequest>({
    mood: MOODS[0],
    genrePreference: GENRES[0],
    timeAvailable: TIMES[0],
    watchingWith: WITH[0],
  });
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onbekende fout");
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  function Select({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
  }) {
    return (
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{label}</span>
        <select
          className="border rounded px-3 py-1.5 bg-transparent"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Wat zullen we kijken?</h1>
      <div className="grid gap-4 max-w-md mb-6">
        <Select
          label="Wat voor stemming?"
          value={answers.mood}
          options={MOODS}
          onChange={(v) => setAnswers({ ...answers, mood: v })}
        />
        <Select
          label="Genre-voorkeur?"
          value={answers.genrePreference}
          options={GENRES}
          onChange={(v) => setAnswers({ ...answers, genrePreference: v })}
        />
        <Select
          label="Hoeveel tijd heb je?"
          value={answers.timeAvailable}
          options={TIMES}
          onChange={(v) => setAnswers({ ...answers, timeAvailable: v })}
        />
        <Select
          label="Met wie kijk je?"
          value={answers.watchingWith}
          options={WITH}
          onChange={(v) => setAnswers({ ...answers, watchingWith: v })}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Bezig..." : "Geef me suggesties"}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {suggestions && (
        <div className="grid gap-3">
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
              <h3 className="font-semibold">
                {s.title} <span className="text-sm text-neutral-500">({s.platform})</span>
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{s.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
