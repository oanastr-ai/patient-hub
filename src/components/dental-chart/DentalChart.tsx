"use client";

import { cn } from "@/lib/utils";
import { CROWN_MID, IMPLANT_PATH, TOOTH_SHAPES } from "./tooth-shapes";

export type ToothStatus =
  | "healthy"
  | "missing"
  | "to_extract"
  | "root_remnant"
  | "caries"
  | "filling"
  | "endo_treated"
  | "veneer"
  | "crown"
  | "bridge_pontic"
  | "denture"
  | "implant"
  | "implant_crown";

export type ToothStateMap = Record<string, ToothStatus>;

/** Suprafețele unui dinte (nomenclatură FDI). Centrul = ocluzal/incizal. */
export type SurfaceKey = "mesial" | "distal" | "vestibular" | "oral" | "occlusal";

export const SURFACE_KEYS: SurfaceKey[] = [
  "mesial",
  "distal",
  "vestibular",
  "oral",
  "occlusal",
];

/**
 * Vocabularul unei suprafețe dentare — diferit de cel al dintelui întreg: o
 * suprafață nu poate fi „absentă" sau „implant", dar poate fi sigilată sau
 * demineralizată.
 */
export type SurfaceStatus =
  | "healthy"
  | "demineralization"
  | "caries"
  | "filling"
  | "inlay_onlay"
  | "sealant";

/** Ordinea din meniu: de la sănătos, prin patologie, la restaurări. */
export const SURFACE_STATUSES: SurfaceStatus[] = [
  "healthy",
  "demineralization",
  "caries",
  "filling",
  "inlay_onlay",
  "sealant",
];

/** Stările per-suprafață ale unui dinte (doar cele non-integre sunt prezente). */
export type ToothSurfaceMap = Partial<Record<SurfaceKey, SurfaceStatus>>;
export type SurfaceStateMap = Record<string, ToothSurfaceMap>;

/**
 * O intrare de legendă: fie o stare de suprafață, fie una de dinte, fie un
 * semn desenat separat (travee, leziune periapicală, X-uri).
 */
export type LegendItem =
  | { kind: "surface"; status: SurfaceStatus }
  | { kind: "tooth"; status: ToothStatus }
  | { kind: "mark"; mark: "periapical" | "travee" | "to_extract" | "missing" };

/** Legenda, grupată pe gravitate crescătoare. */
export const LEGEND_GROUPS: { group: string; items: LegendItem[] }[] = [
  {
    group: "preventiv",
    items: [
      { kind: "surface", status: "sealant" },
      { kind: "surface", status: "demineralization" },
    ],
  },
  {
    group: "active",
    items: [
      { kind: "surface", status: "caries" },
      { kind: "mark", mark: "periapical" },
    ],
  },
  {
    group: "restorations",
    items: [
      { kind: "surface", status: "filling" },
      { kind: "surface", status: "inlay_onlay" },
      { kind: "tooth", status: "veneer" },
    ],
  },
  {
    group: "endo",
    items: [{ kind: "tooth", status: "endo_treated" }],
  },
  {
    group: "prosthetic",
    items: [
      { kind: "tooth", status: "crown" },
      { kind: "tooth", status: "bridge_pontic" },
      { kind: "mark", mark: "travee" },
      { kind: "tooth", status: "denture" },
    ],
  },
  {
    group: "loss",
    items: [
      { kind: "tooth", status: "root_remnant" },
      { kind: "mark", mark: "to_extract" },
      { kind: "mark", mark: "missing" },
      { kind: "tooth", status: "implant" },
      { kind: "tooth", status: "implant_crown" },
    ],
  },
];

/**
 * Clasa de umplere a pastilei de legendă. Citește din aceleași tabele ca
 * odontograma, deci o schimbare de paletă se reflectă automat în legendă.
 */
export function legendSwatch(item: LegendItem): string {
  if (item.kind === "surface") return SURFACE_FILL[item.status];
  if (item.kind === "tooth") {
    // pentru endodonție și rest radicular, culoarea semnificativă e a rădăcinii
    return item.status === "endo_treated" || item.status === "root_remnant"
      ? rootFill(item.status)
      : STATUS_FILL[item.status];
  }
  return "fill-background";
}

/** Referință la o suprafață anume, folosită pentru selecție: „16:occlusal". */
export function surfaceRef(code: string, surface: SurfaceKey) {
  return `${code}:${surface}`;
}

// Ordinea FDI, din perspectiva medicului (dreapta pacientului = stânga imaginii)
const UPPER = ["18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28"];
const LOWER = ["48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38"];

export const ALL_TEETH = [...UPPER, ...LOWER];

/** '24' -> '2.4' pentru afișare */
export function formatTooth(code: string) {
  return code.length === 2 ? `${code[0]}.${code[1]}` : code;
}

/** Câte rădăcini are dintele — pentru a ști câte leziuni periapicale se pot marca. */
export function rootCount(code: string) {
  return TOOTH_SHAPES[code]?.apices.length ?? 1;
}

/**
 * Culorile dintelui întreg. Aurul cald al coroanei protetice e ținut distinct
 * de galbenul pal, care rămâne exclusiv al demineralizării (vezi SURFACE_FILL)
 * — altfel cele două lucrări se confundă pe odontogramă.
 */
const STATUS_FILL: Record<ToothStatus, string> = {
  healthy: "fill-background",
  missing: "fill-muted",
  to_extract: "fill-background",
  root_remnant: "fill-background",
  caries: "fill-red-300 dark:fill-red-900",
  filling: "fill-blue-300 dark:fill-blue-800",
  endo_treated: "fill-background",
  veneer: "fill-[#e9d5ff] dark:fill-purple-900",
  crown: "fill-[#e8b455] dark:fill-[#8a6520]",
  bridge_pontic: "fill-[#f2d49b] dark:fill-[#6b5228]",
  denture: "fill-zinc-300 dark:fill-zinc-700",
  implant: "fill-[#cbd5e1] dark:fill-slate-700",
  implant_crown: "fill-[#cbd5e1] dark:fill-slate-700",
};

/**
 * Culorile suprafețelor, grupate semantic: chihlimbar = leziune incipientă,
 * roșu = carie activă, albastru/indigo = restaurări, verde = profilaxie.
 */
const SURFACE_FILL: Record<SurfaceStatus, string> = {
  healthy: "fill-background",
  demineralization: "fill-amber-200 dark:fill-amber-900",
  caries: "fill-red-300 dark:fill-red-900",
  filling: "fill-blue-300 dark:fill-blue-800",
  inlay_onlay: "fill-indigo-300 dark:fill-indigo-800",
  sealant: "fill-emerald-300 dark:fill-emerald-800",
};

/** Rădăcina: fildeș, ca în odontogramele clasice. */
const ROOT_FILL = "fill-[#f3edc3] dark:fill-[#4c4629]";

/** Culoarea rădăcinii după starea dintelui (endo = rădăcină obturată, portocalie). */
function rootFill(status: ToothStatus) {
  switch (status) {
    case "endo_treated":
      return "fill-orange-400 dark:fill-orange-600";
    case "implant":
    case "implant_crown":
      // fixtura e metalică, nu fildeș ca o rădăcină
      return "fill-slate-400 dark:fill-slate-600";
    case "missing":
      return "fill-muted";
    default:
      return ROOT_FILL;
  }
}

const OUTLINE = "stroke-muted-foreground/60";

const TOOTH_W = 32;
const TOOTH_H = 64;
const GAP = 7;
const MIDLINE_GAP = 14;
const CX = TOOTH_W / 2; // axul dintelui în celula lui

const RING_R = 15;

function toothX(index: number) {
  return index * (TOOTH_W + GAP) + (index >= 8 ? MIDLINE_GAP : 0);
}

const ROW_WIDTH = toothX(15) + TOOTH_W;

// Aranjarea pe verticală, preluată ca atare din odontograma aprobată în design:
// dinți sus → inele → numere → numere → inele → dinți jos.
const UPPER_Y = 2;
const RING_CY_UPPER = 85;
const LABEL_UPPER_Y = 115;
const LABEL_LOWER_Y = 135;
const RING_CY_LOWER = 156;
const LOWER_Y = 175;
const CHART_H = 241;

/**
 * Marginea din jurul desenului. Conturul dinților de la capete depășește
 * lățimea celulelor cu ~2,6 px (punctele de control ale coroanei ies în afară),
 * așa că fără margine primul și ultimul dinte apar tăiați.
 */
const CHART_PAD = 5;

/**
 * Ce se desenează pentru fiecare stare: ce e sub colet și dacă are coroană.
 * Corpul de punte și dintele de proteză sunt suspendate pe lucrare, restul
 * radicular și-a pierdut coroana, iar implantul fără lucrare n-are încă una.
 */
function toothParts(status: ToothStatus): {
  below: "roots" | "implant" | "none";
  crown: boolean;
} {
  switch (status) {
    case "implant":
      return { below: "implant", crown: false };
    case "implant_crown":
      return { below: "implant", crown: true };
    case "bridge_pontic":
    case "denture":
      return { below: "none", crown: true };
    case "root_remnant":
      return { below: "roots", crown: false };
    case "missing":
      // dintele nu mai e pe arcadă: rămâne doar semnul
      return { below: "none", crown: false };
    default:
      return { below: "roots", crown: true };
  }
}

/**
 * Stările care pot face parte dintr-o lucrare de punte. Coroana pe implant e
 * inclusă: o punte se poate sprijini și pe implanturi, nu doar pe dinți.
 */
function isBridgeUnit(status: ToothStatus | undefined) {
  return (
    status === "crown" || status === "bridge_pontic" || status === "implant_crown"
  );
}

/**
 * Intervalele [primul, ultimul] ale punților dintr-o arcadă. Se caută șiruri
 * de unități alăturate, dar un șir e considerat punte doar dacă are măcar un
 * corp de punte — altfel două coroane individuale vecine ar apărea legate.
 */
function bridgeSpans(row: string[], states: ToothStateMap): [number, number][] {
  const spans: [number, number][] = [];
  let i = 0;
  while (i < row.length) {
    if (!isBridgeUnit(states[row[i]])) {
      i += 1;
      continue;
    }
    let j = i;
    while (j + 1 < row.length && isBridgeUnit(states[row[j + 1]])) j += 1;
    if (j > i && row.slice(i, j + 1).some((c) => states[c] === "bridge_pontic")) {
      spans.push([i, j]);
    }
    i = j + 1;
  }
  return spans;
}

const TRAVEE_OFFSET = 5; // cât iese travea dincolo de marginea ocluzală

/**
 * Travea punții: un etrier desenat dincolo de marginea ocluzală, care leagă
 * capetele lucrării. Spre deosebire de o bară plină între coroane, arată că
 * unitățile fac parte din aceeași piesă fără să le altereze forma.
 */
function BridgeTravee({
  row,
  from,
  to,
  isUpper,
}: {
  row: string[];
  from: number;
  to: number;
  isUpper: boolean;
}) {
  // Etrierul se sprijină pe marginile reale ale coroanelor de la capete, nu pe
  // marginile celulelor: conturul unui molar depășește celula cu ~1,6 px, iar
  // un picior așezat pe celulă ar cădea peste coroană.
  const x1 = toothX(from) + TOOTH_SHAPES[row[from]].crownX[0];
  const x2 = toothX(to) + TOOTH_SHAPES[row[to]].crownX[1];
  // marginea ocluzală: baza celulei la maxilar, vârful ei la mandibulă
  const edge = isUpper ? UPPER_Y + TOOTH_H - 2 : LOWER_Y + 2;
  const bar = isUpper ? edge + TRAVEE_OFFSET : edge - TRAVEE_OFFSET;

  return (
    <path
      d={`M ${x1} ${edge} L ${x1} ${bar} L ${x2} ${bar} L ${x2} ${edge}`}
      fill="none"
      className={cn(OUTLINE, "transition-colors")}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

/** Un sector inelar între unghiurile a1 și a2 (grade, y în jos), rază R..r. */
function ringSegmentPath(a1: number, a2: number, R: number, r: number): string {
  const pt = (ang: number, rad: number): [number, number] => {
    const rad2 = (ang * Math.PI) / 180;
    return [rad * Math.cos(rad2), rad * Math.sin(rad2)];
  };
  const [x1o, y1o] = pt(a1, R);
  const [x2o, y2o] = pt(a2, R);
  const [x2i, y2i] = pt(a2, r);
  const [x1i, y1i] = pt(a1, r);
  return (
    `M ${x1i} ${y1i} L ${x1o} ${y1o}` +
    ` A ${R} ${R} 0 0 1 ${x2o} ${y2o}` +
    ` L ${x2i} ${y2i}` +
    ` A ${r} ${r} 0 0 0 ${x1i} ${y1i} Z`
  );
}

/**
 * Inelul de suprafețe: disc central (ocluzal) + 4 sectoare exterioare
 * (mezial / distal / vestibular / oral). Orientarea se calculează din cadran
 * și arcadă, ca meziala să fie spre linia mediană și vestibularul spre
 * exteriorul arcadei.
 */
function SurfaceRing({
  code,
  isUpper,
  surfaces,
  selectedSurfaces,
  onSurfaceClick,
}: {
  code: string;
  isUpper: boolean;
  surfaces: ToothSurfaceMap;
  selectedSurfaces: SurfaceKey[];
  onSurfaceClick?: (
    code: string,
    surface: SurfaceKey,
    ev: { clientX: number; clientY: number }
  ) => void;
}) {
  const R = RING_R;
  const rIn = R * 0.44;

  const quadrant = Number(code[0]);
  const mesialRight = quadrant === 1 || quadrant === 4;
  const rightSurface: SurfaceKey = mesialRight ? "mesial" : "distal";
  const leftSurface: SurfaceKey = mesialRight ? "distal" : "mesial";
  const topSurface: SurfaceKey = isUpper ? "vestibular" : "oral";
  const bottomSurface: SurfaceKey = isUpper ? "oral" : "vestibular";

  const outer: { key: SurfaceKey; d: string }[] = [
    { key: rightSurface, d: ringSegmentPath(-45, 45, R, rIn) },
    { key: bottomSurface, d: ringSegmentPath(45, 135, R, rIn) },
    { key: leftSurface, d: ringSegmentPath(135, 225, R, rIn) },
    { key: topSurface, d: ringSegmentPath(225, 315, R, rIn) },
  ];

  const clickable = !!onSurfaceClick;
  const isSelected = (surface: SurfaceKey) => selectedSurfaces.includes(surface);

  function segClass(surface: SurfaceKey) {
    const status = surfaces[surface];
    return cn(
      status ? SURFACE_FILL[status] : "fill-background",
      "transition-colors",
      isSelected(surface) ? "stroke-primary" : OUTLINE,
      clickable && "cursor-pointer hover:stroke-primary hover:stroke-2"
    );
  }

  function handle(surface: SurfaceKey) {
    return (e: React.MouseEvent) => {
      if (!onSurfaceClick) return;
      e.stopPropagation();
      onSurfaceClick(code, surface, { clientX: e.clientX, clientY: e.clientY });
    };
  }

  return (
    <g>
      {outer.map((seg) => (
        <path
          key={seg.key}
          d={seg.d}
          className={segClass(seg.key)}
          strokeWidth={isSelected(seg.key) ? 2.5 : 1}
          onClick={handle(seg.key)}
        />
      ))}
      <circle
        cx={0}
        cy={0}
        r={rIn}
        className={segClass("occlusal")}
        strokeWidth={isSelected("occlusal") ? 2.5 : 1}
        onClick={handle("occlusal")}
      />
    </g>
  );
}

function Tooth({
  code,
  isUpper,
  status,
  selected,
  surfaces,
  selectedSurfaces,
  periapical,
  showRing,
  onClick,
  onSurfaceClick,
}: {
  code: string;
  isUpper: boolean;
  status: ToothStatus;
  selected: boolean;
  surfaces: ToothSurfaceMap;
  selectedSurfaces: SurfaceKey[];
  /** Indicii rădăcinilor cu leziune periapicală. */
  periapical: number[];
  showRing: boolean;
  onClick?: (
    code: string,
    opts: { shiftKey: boolean; ctrlKey: boolean }
  ) => void;
  onSurfaceClick?: (
    code: string,
    surface: SurfaceKey,
    ev: { clientX: number; clientY: number }
  ) => void;
}) {
  const row = isUpper ? UPPER : LOWER;
  const x = toothX(row.indexOf(code));
  const shape = TOOTH_SHAPES[code];
  const rowY = isUpper ? UPPER_Y : LOWER_Y;

  // Formele sunt desenate o singură dată, cu rădăcinile în sus; arcada
  // inferioară le oglindește vertical ca să formeze o arcadă reală.
  const bodyTransform = isUpper
    ? undefined
    : `translate(0 ${TOOTH_H}) scale(1 -1)`;

  const ringY = (isUpper ? RING_CY_UPPER : RING_CY_LOWER) - rowY;
  const labelY = (isUpper ? LABEL_UPPER_Y : LABEL_LOWER_Y) - rowY;

  const parts = toothParts(status);
  const strokeW = selected ? 2 : 1.2;
  const bodyClass = cn(
    OUTLINE,
    "transition-colors",
    selected && "stroke-primary",
    onClick && "hover:stroke-primary"
  );

  // Centrul coroanei, pentru X-uri. Semnele se desenează în afara grupului
  // oglindit, deci la arcada inferioară cota se răstoarnă — altfel X-ul ar
  // ajunge peste rădăcină.
  const cy = isUpper ? CROWN_MID : TOOTH_H - CROWN_MID;

  return (
    <g transform={`translate(${x} ${rowY})`} aria-label={`Dinte ${formatTooth(code)}`}>
      <g
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(code, {
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey || e.metaKey,
          });
        }}
        className={cn(onClick && "cursor-pointer")}
        role={onClick ? "button" : undefined}
      >
        <g transform={bodyTransform}>
          {parts.below === "implant" && (
            <path
              d={IMPLANT_PATH}
              className={cn(rootFill(status), bodyClass)}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
          )}
          {parts.below === "roots" &&
            shape.roots.map((d, i) => (
              <path
                key={i}
                d={d}
                className={cn(rootFill(status), bodyClass)}
                strokeWidth={strokeW}
                strokeLinejoin="round"
              />
            ))}
          {parts.crown && (
            <path
              d={shape.crown}
              className={cn(STATUS_FILL[status], bodyClass)}
              strokeWidth={strokeW}
              strokeLinejoin="round"
            />
          )}
          {/* Leziunile periapicale, la vârful rădăcinii afectate */}
          {parts.below === "roots" &&
            periapical.map((i) => {
              const a = shape.apices[i];
              return a ? (
                <circle
                  key={i}
                  cx={a.x}
                  cy={a.y}
                  r={4.4}
                  className="fill-rose-200 stroke-rose-600 dark:fill-rose-950"
                  strokeWidth={1}
                  strokeDasharray="2.4 1.8"
                />
              ) : null;
            })}
        </g>
        {/* Absent = X deschis (dintele nu mai e), de extras = X închis
            (dintele e încă pe arcadă, dar programat pentru extracție). */}
        {(status === "missing" || status === "to_extract") && (
          <g
            className={
              status === "to_extract"
                ? "stroke-stone-700 dark:stroke-stone-300"
                : "stroke-muted-foreground/60"
            }
            strokeWidth={status === "to_extract" ? 2.4 : 2}
            strokeLinecap="round"
          >
            <line x1={CX - 8} y1={cy - 8} x2={CX + 8} y2={cy + 8} />
            <line x1={CX + 8} y1={cy - 8} x2={CX - 8} y2={cy + 8} />
          </g>
        )}
      </g>
      {showRing && (
        <g transform={`translate(${CX} ${ringY})`}>
          <SurfaceRing
            code={code}
            isUpper={isUpper}
            surfaces={surfaces}
            selectedSurfaces={selectedSurfaces}
            onSurfaceClick={onSurfaceClick}
          />
        </g>
      )}
      <text
        x={CX}
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
  surfaces = {},
  periapical = {},
  selected = [],
  selectedSurfaces = [],
  onToothClick,
  onSurfaceClick,
  onBackgroundClick,
  className,
}: {
  states?: ToothStateMap;
  surfaces?: SurfaceStateMap;
  /** Rădăcinile cu leziune periapicală, pe cod de dinte: { "16": [0] }. */
  periapical?: Record<string, number[]>;
  selected?: string[];
  /** Suprafețele bifate, ca referințe „16:occlusal" (vezi surfaceRef). */
  selectedSurfaces?: string[];
  onToothClick?: (
    code: string,
    opts: { shiftKey: boolean; ctrlKey: boolean }
  ) => void;
  onSurfaceClick?: (
    code: string,
    surface: SurfaceKey,
    ev: { clientX: number; clientY: number }
  ) => void;
  /** Click pe zona goală a odontogramei (deselectare). */
  onBackgroundClick?: () => void;
  className?: string;
}) {
  const selectedSet = new Set(selected);
  const selectedSurfaceSet = new Set(selectedSurfaces);

  const renderTooth = (code: string, isUpper: boolean) => {
    const toothSurfaces = surfaces[code] ?? {};
    const picked = SURFACE_KEYS.filter((s) =>
      selectedSurfaceSet.has(surfaceRef(code, s))
    );
    return (
      <Tooth
        key={code}
        code={code}
        isUpper={isUpper}
        status={states[code] ?? "healthy"}
        selected={selectedSet.has(code)}
        surfaces={toothSurfaces}
        selectedSurfaces={picked}
        periapical={periapical[code] ?? []}
        // inelul rămâne vizibil și pentru suprafețele alese, ca selecția să nu
        // dispară când medicul trece la alt dinte
        showRing={
          selectedSet.has(code) ||
          Object.keys(toothSurfaces).length > 0 ||
          picked.length > 0
        }
        onClick={onToothClick}
        onSurfaceClick={onSurfaceClick}
      />
    );
  };

  const midX = toothX(8) - MIDLINE_GAP / 2 - GAP / 2;

  return (
    <svg
      viewBox={`${-CHART_PAD} ${-CHART_PAD} ${ROW_WIDTH + CHART_PAD * 2} ${CHART_H + CHART_PAD * 2}`}
      className={cn("w-full touch-manipulation", className)}
      onClick={() => onBackgroundClick?.()}
    >
      {UPPER.map((code) => renderTooth(code, true))}
      {LOWER.map((code) => renderTooth(code, false))}
      {/* travee peste dinți: leagă capetele fiecărei punți */}
      {bridgeSpans(UPPER, states).map(([i, j]) => (
        <BridgeTravee key={`travee-u-${i}`} row={UPPER} from={i} to={j} isUpper />
      ))}
      {bridgeSpans(LOWER, states).map(([i, j]) => (
        <BridgeTravee
          key={`travee-l-${i}`}
          row={LOWER}
          from={i}
          to={j}
          isUpper={false}
        />
      ))}
      {/* linia mediană */}
      <line
        x1={midX}
        y1={UPPER_Y}
        x2={midX}
        y2={CHART_H - 2}
        className="stroke-border"
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    </svg>
  );
}
