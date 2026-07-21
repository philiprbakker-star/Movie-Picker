import type { Title } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/types";

export function TitleCard({ title }: { title: Title }) {
  return (
    <div className="flex gap-4 rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
      {title.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={title.posterUrl} alt={title.title} className="w-20 h-28 object-cover rounded" />
      ) : (
        <div className="w-20 h-28 rounded bg-neutral-100 dark:bg-neutral-800 shrink-0" />
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="font-semibold truncate">{title.title}</h3>
        <div className="text-sm text-neutral-500">
          {title.year ?? "?"} · {title.runtimeMinutes ? `${title.runtimeMinutes} min` : "?"} ·{" "}
          ⭐ {title.imdbRating ?? "?"}
        </div>
        <div className="text-xs text-neutral-500">{title.genres.join(", ")}</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {title.platforms.map((p) => (
            <span
              key={p}
              className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded px-2 py-0.5"
            >
              {PLATFORM_LABELS[p]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
