import { cn } from "@/lib/utils";
import type { TextBlock } from "@/lib/questionnaires";

/** Paragrafele de citit ale unei secțiuni (ex. riscurile din consimțământ). */
export function TextBlocks({ blocks, className }: { blocks: TextBlock[]; className?: string }) {
  return (
    <div className={cn("space-y-3 leading-relaxed", className)}>
      {blocks.map((b, i) =>
        typeof b === "string" ? (
          <p key={i}>{b}</p>
        ) : "list" in b ? (
          <ul key={i} className="list-disc space-y-1.5 pl-5">
            {b.list.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <h3 key={i} className="pt-1 font-semibold">
            {b.heading}
          </h3>
        )
      )}
    </div>
  );
}
