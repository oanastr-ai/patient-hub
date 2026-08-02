"use client";

import { ro } from "@/i18n/ro";
import { cn } from "@/lib/utils";
import {
  LEGEND_GROUPS,
  legendSwatch,
  type LegendItem,
} from "./DentalChart";

/** Eticheta unei intrări, din aceleași dicționare ca restul fișei. */
function itemLabel(item: LegendItem): string {
  switch (item.kind) {
    case "surface":
      return ro.fisa.surfaceStatusLabels[item.status];
    case "tooth":
      return ro.fisa.statusLabels[item.status];
    default:
      return ro.fisa.legendMarks[item.mark];
  }
}

/**
 * Pastila de culoare. E un SVG, nu un div, ca să poată folosi exact aceleași
 * clase `fill-*` ca odontograma — altfel legenda ar diverge de desen.
 */
function Swatch({ item }: { item: LegendItem }) {
  if (item.kind === "mark") {
    return (
      <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden className="shrink-0">
        {item.mark === "periapical" && (
          <circle
            cx={7}
            cy={7}
            r={5}
            className="fill-rose-200 stroke-rose-600 dark:fill-rose-950"
            strokeWidth={1}
            strokeDasharray="2.4 1.8"
          />
        )}
        {item.mark === "travee" && (
          <path
            d="M 2 10 L 2 4 L 12 4 L 12 10"
            fill="none"
            className="stroke-muted-foreground"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {(item.mark === "to_extract" || item.mark === "missing") && (
          <g
            className={
              item.mark === "to_extract"
                ? "stroke-stone-700 dark:stroke-stone-300"
                : "stroke-muted-foreground/60"
            }
            strokeWidth={item.mark === "to_extract" ? 2.2 : 1.8}
            strokeLinecap="round"
          >
            <line x1={3} y1={3} x2={11} y2={11} />
            <line x1={11} y1={3} x2={3} y2={11} />
          </g>
        )}
      </svg>
    );
  }

  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden className="shrink-0">
      <rect
        x={1}
        y={1}
        width={12}
        height={12}
        rx={3}
        className={cn(legendSwatch(item), "stroke-muted-foreground/50")}
        strokeWidth={1}
      />
    </svg>
  );
}

/** Legenda odontogramei, grupată pe gravitate crescătoare. */
export function DentalChartLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-7 gap-y-4 text-muted-foreground",
        className
      )}
    >
      {LEGEND_GROUPS.map(({ group, items }) => (
        <div key={group} className="space-y-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {ro.fisa.legendGroups[group as keyof typeof ro.fisa.legendGroups]}
          </h3>
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <Swatch item={item} />
                {itemLabel(item)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
