"use client";

import { cn } from "@/lib/utils";

export type ToothStatus =
  | "healthy"
  | "missing"
  | "implant"
  | "crown"
  | "bridge_pontic"
  | "filling"
  | "endo_treated"
  | "veneer"
  | "to_extract"
  | "caries"
  | "denture";

export type ToothStateMap = Record<string, ToothStatus>;

// Ordinea FDI, din perspectiva medicului (dreapta pacientului = stânga imaginii)
const UPPER = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const LOWER = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

export const ALL_TEETH = [...UPPER, ...LOWER];

/** '24' -> '2.4' pentru afișare */
export function formatTooth(code: string) {
  return code.length === 2 ? `${code[0]}.${code[1]}` : code;
}

const STATUS_FILL: Record<ToothStatus, string> = {
  healthy: "fill-background",
  missing: "fill-muted",
  implant: "fill-teal-200 dark:fill-teal-900",
  crown: "fill-amber-200 dark:fill-amber-900",
  bridge_pontic: "fill-amber-100 dark:fill-amber-950",
  filling: "fill-blue-200 dark:fill-blue-900",
  endo_treated: "fill-purple-200 dark:fill-purple-900",
  veneer: "fill-cyan-200 dark:fill-cyan-900",
  to_extract: "fill-red-300 dark:fill-red-900",
  caries: "fill-red-200 dark:fill-red-950",
  denture: "fill-zinc-300 dark:fill-zinc-700",
};

const TOOTH_W = 34;
const TOOTH_H = 44;
const GAP = 6;
const MIDLINE_GAP = 14;
const LABEL_H = 16;

function toothX(index: number) {
  return index * (TOOTH_W + GAP) + (index >= 8 ? MIDLINE_GAP : 0);
}

const ROW_WIDTH = toothX(15) + TOOTH_W;

function Tooth({
  code,
  y,
  labelAbove,
  status,
  selected,
  onClick,
}: {
  code: string;
  y: number;
  labelAbove: boolean;
  status: ToothStatus;
  selected: boolean;
  onClick?: (code: string) => void;
}) {
  const index = (UPPER.includes(code) ? UPPER : LOWER).indexOf(code);
  const x = toothX(index);
  const labelY = labelAbove ? y - 5 : y + TOOTH_H + 13;

  return (
    <g
      onClick={() => onClick?.(code)}
      className={cn(onClick && "cursor-pointer")}
      role={onClick ? "button" : undefined}
      aria-label={`Dinte ${formatTooth(code)}`}
    >
      <rect
        x={x}
        y={y}
        width={TOOTH_W}
        height={TOOTH_H}
        rx={10}
        className={cn(
          STATUS_FILL[status],
          "stroke-border transition-colors",
          selected && "stroke-primary stroke-[3px]",
          onClick && "hover:stroke-primary"
        )}
        strokeWidth={selected ? 3 : 1.5}
      />
      {status === "missing" && (
        <>
          <line x1={x + 8} y1={y + 10} x2={x + TOOTH_W - 8} y2={y + TOOTH_H - 10} className="stroke-muted-foreground" strokeWidth={2} />
          <line x1={x + TOOTH_W - 8} y1={y + 10} x2={x + 8} y2={y + TOOTH_H - 10} className="stroke-muted-foreground" strokeWidth={2} />
        </>
      )}
      {status === "implant" && (
        <text x={x + TOOTH_W / 2} y={y + TOOTH_H / 2 + 5} textAnchor="middle" className="fill-teal-700 dark:fill-teal-300 text-[14px] font-bold pointer-events-none">
          ⌀
        </text>
      )}
      <text
        x={x + TOOTH_W / 2}
        y={labelY}
        textAnchor="middle"
        className={cn(
          "text-[11px] pointer-events-none select-none",
          selected ? "fill-primary font-bold" : "fill-muted-foreground"
        )}
      >
        {formatTooth(code)}
      </text>
    </g>
  );
}

export function DentalChart({
  states = {},
  selected = [],
  onToothClick,
  className,
}: {
  states?: ToothStateMap;
  selected?: string[];
  onToothClick?: (code: string) => void;
  className?: string;
}) {
  const upperY = LABEL_H;
  const lowerY = upperY + TOOTH_H + 26;
  const height = lowerY + TOOTH_H + LABEL_H + 4;
  const selectedSet = new Set(selected);

  return (
    <svg
      viewBox={`0 0 ${ROW_WIDTH} ${height}`}
      className={cn("w-full max-w-2xl touch-manipulation", className)}
    >
      {UPPER.map((code) => (
        <Tooth
          key={code}
          code={code}
          y={upperY}
          labelAbove
          status={states[code] ?? "healthy"}
          selected={selectedSet.has(code)}
          onClick={onToothClick}
        />
      ))}
      {LOWER.map((code) => (
        <Tooth
          key={code}
          code={code}
          y={lowerY}
          labelAbove={false}
          status={states[code] ?? "healthy"}
          selected={selectedSet.has(code)}
          onClick={onToothClick}
        />
      ))}
      {/* linia mediană */}
      <line
        x1={toothX(8) - MIDLINE_GAP / 2 - GAP / 2}
        y1={LABEL_H}
        x2={toothX(8) - MIDLINE_GAP / 2 - GAP / 2}
        y2={height - LABEL_H}
        className="stroke-border"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    </svg>
  );
}
