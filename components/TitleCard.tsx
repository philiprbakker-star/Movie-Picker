import type { Title } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/types";

export function TitleCard({ title }: { title: Title }) {
  return (
    <div className="relative flex flex-col rounded-xl border border-black/5 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative">
        {title.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={title.posterUrl}
            alt={title.title}
            className="w-full aspect-[2/3] object-cover bg-neutral-100"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}
        {title.imdbRating !== null && (
          <div className="absolute top-3 left-3 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-[#4f46e5] shadow">
            <span className="text-sm font-bold text-[#0f0726] leading-none">
              {title.imdbRating.toFixed(1)}
            </span>
            <span className="text-[9px] font-medium text-neutral-400 leading-none mt-0.5">
              IMDb
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-bold leading-snug">{title.title}</h3>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500">
          <span className="flex items-center gap-1">📅 {title.year ?? "?"}</span>
          <span className="flex items-center gap-1">
            ⏱ {title.runtimeMinutes ? `${title.runtimeMinutes} min` : "?"}
          </span>
        </div>

        <div className="text-xs text-neutral-500 truncate">{title.genres.join(", ")}</div>

        <div className="flex flex-wrap gap-1 mt-1">
          {title.platforms.map((p) => (
            <span
              key={p}
              className="text-xs bg-[#eef2ff] text-[#4f46e5] rounded-full px-2.5 py-1 font-medium"
            >
              {PLATFORM_LABELS[p]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
