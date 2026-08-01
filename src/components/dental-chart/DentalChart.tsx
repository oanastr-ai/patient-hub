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

type ToothType = "incisor_central" | "incisor_lateral" | "canine" | "premolar" | "molar";

/** Tipul anatomic după ultima cifră FDI (poziția în cadran). */
function toothType(code: string): ToothType {
  switch (code[1]) {
    case "1":
      return "incisor_central";
    case "2":
      return "incisor_lateral";
    case "3":
      return "canine";
    case "4":
    case "5":
      return "premolar";
    default:
      return "molar"; // 6, 7, 8
  }
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

const TOOTH_W = 32;
const TOOTH_H = 42;
const GAP = 7;
const MIDLINE_GAP = 14;
const LABEL_H = 18;

function toothX(index: number) {
  return index * (TOOTH_W + GAP) + (index >= 8 ? MIDLINE_GAP : 0);
}

const ROW_WIDTH = toothX(15) + TOOTH_W;

/**
 * Conturul coroanei pentru un tip de dinte, în coordonate locale ale celulei
 * (0..W lățime, 0..H înălțime), cu marginea ocluzală/incizală în JOS (biting
 * edge la y ≈ H). Colul (cervical) e sus, rotunjit. Fiecare tip are lățime și
 * profil ocluzal distinct: incisivii au margine dreaptă, caninul un vârf,
 * premolarii un cuspid rotunjit, molarii mai mulți cuspizi.
 */
function crownPath(W: number, H: number, type: ToothType): string {
  const m = 2.5;
  const config: Record<ToothType, { widthFrac: number; edge: "flat" | "point" | "cusp" | "molar" }> = {
    incisor_central: { widthFrac: 0.9, edge: "flat" },
    incisor_lateral: { widthFrac: 0.76, edge: "flat" },
    canine: { widthFrac: 0.68, edge: "point" },
    premolar: { widthFrac: 0.74, edge: "cusp" },
    molar: { widthFrac: 0.98, edge: "molar" },
  };
  const { widthFrac, edge } = config[type];

  const cw = W * widthFrac;
  const x0 = (W - cw) / 2;
  const x1 = W - x0;
  const mid = W / 2;
  const r = Math.min(8, cw * 0.32); // rotunjire col
  const cervY = m;
  const yB = H - m; // linia ocluzală

  let d = `M ${x0} ${cervY + r}`;
  d += ` Q ${x0} ${cervY} ${x0 + r} ${cervY}`;
  d += ` L ${x1 - r} ${cervY}`;
  d += ` Q ${x1} ${cervY} ${x1} ${cervY + r}`;

  if (edge === "flat") {
    d += ` L ${x1} ${yB}`;
    d += ` L ${x0} ${yB}`;
  } else if (edge === "point") {
    // canin: un singur vârf ascuțit în centru
    d += ` L ${x1} ${yB - 7}`;
    d += ` L ${mid} ${yB}`;
    d += ` L ${x0} ${yB - 7}`;
  } else if (edge === "cusp") {
    // premolar: un cuspid rotunjit
    d += ` L ${x1} ${yB - 4}`;
    d += ` Q ${mid} ${yB + 3} ${x0} ${yB - 4}`;
  } else {
    // molar: doi cuspizi rotunjiți
    d += ` L ${x1} ${yB - 3}`;
    d += ` Q ${x1 - cw * 0.26} ${yB + 3} ${mid} ${yB - 3}`;
    d += ` Q ${x0 + cw * 0.26} ${yB + 3} ${x0} ${yB - 3}`;
  }

  d += ` L ${x0} ${cervY + r} Z`;
  return d;
}

function Tooth({
  code,
  rowY,
  labelAbove,
  status,
  selected,
  onClick,
}: {
  code: string;
  rowY: number;
  labelAbove: boolean;
  status: ToothStatus;
  selected: boolean;
  onClick?: (
    code: string,
    opts: { shiftKey: boolean; ctrlKey: boolean }
  ) => void;
}) {
  const index = (UPPER.includes(code) ? UPPER : LOWER).indexOf(code);
  const x = toothX(index);
  const type = toothType(code);
  const d = crownPath(TOOTH_W, TOOTH_H, type);

  // Dinții inferiori: oglindim vertical, ca marginea ocluzală să fie în sus
  // (spre linia mediană), formând o arcadă reală.
  const flip = !labelAbove;
  const crownTransform = flip
    ? `translate(0 ${TOOTH_H}) scale(1 -1)`
    : undefined;

  const labelY = labelAbove ? -6 : TOOTH_H + 14;
  const cx = TOOTH_W / 2;
  const cy = TOOTH_H / 2;

  return (
    <g
      transform={`translate(${x} ${rowY})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(code, {
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey || e.metaKey,
        });
      }}
      className={cn(onClick && "cursor-pointer")}
      role={onClick ? "button" : undefined}
      aria-label={`Dinte ${formatTooth(code)}`}
    >
      <path
        d={d}
        transform={crownTransform}
        className={cn(
          STATUS_FILL[status],
          "stroke-border transition-colors",
          selected && "stroke-primary",
          onClick && "hover:stroke-primary"
        )}
        strokeWidth={selected ? 2.5 : 1.4}
        strokeLinejoin="round"
      />
      {status === "missing" && (
        <>
          <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} className="stroke-muted-foreground" strokeWidth={2} />
          <line x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8} className="stroke-muted-foreground" strokeWidth={2} />
        </>
      )}
      {status === "implant" && (
        <text x={cx} y={cy + 5} textAnchor="middle" className="fill-teal-700 dark:fill-teal-300 text-[14px] font-bold pointer-events-none">
          ⌀
        </text>
      )}
      <text
        x={cx}
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
  onBackgroundClick,
  className,
}: {
  states?: ToothStateMap;
  selected?: string[];
  onToothClick?: (
    code: string,
    opts: { shiftKey: boolean; ctrlKey: boolean }
  ) => void;
  /** Click pe zona goală a odontogramei (deselectare). */
  onBackgroundClick?: () => void;
  className?: string;
}) {
  const upperY = LABEL_H;
  const lowerY = upperY + TOOTH_H + 30;
  const height = lowerY + TOOTH_H + LABEL_H + 2;
  const selectedSet = new Set(selected);

  return (
    <svg
      viewBox={`0 0 ${ROW_WIDTH} ${height}`}
      className={cn("w-full touch-manipulation", className)}
      onClick={() => onBackgroundClick?.()}
    >
      {UPPER.map((code) => (
        <Tooth
          key={code}
          code={code}
          rowY={upperY}
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
          rowY={lowerY}
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
