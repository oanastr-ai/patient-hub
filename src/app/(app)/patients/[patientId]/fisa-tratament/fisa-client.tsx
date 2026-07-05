"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  BellPlus,
  ChevronDown,
  Info,
  OctagonAlert,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { ro } from "@/i18n/ro";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DateField } from "@/components/ui/date-field";
import {
  ALL_TEETH,
  DentalChart,
  formatTooth,
  type ToothStateMap,
  type ToothStatus,
} from "@/components/dental-chart/DentalChart";
import {
  addAlert,
  addDoctor,
  addProcedure,
  addProstheticWork,
  addReminder,
  addSession,
  deleteSession,
  dismissAlert,
  setToothState,
  updateSession,
} from "./actions";

// ---------- Tipuri ----------

type Alert = { id: string; message_ro: string; severity: string };
type Doctor = { id: string; full_name: string };
type Category = { id: string; code: string; name_ro: string };
type Procedure = { id: string; name_ro: string; category_id: string };
type SessionItem = {
  id: string;
  tooth_codes: string[];
  note: string | null;
  procedure: { id: string; name_ro: string } | null;
};
type Session = {
  id: string;
  session_date: string;
  notes: string | null;
  doctor: { id: string; full_name: string } | null;
  items: SessionItem[];
};
type Prosthetic = {
  id: string;
  work_date: string;
  plan: string | null;
  material: string | null;
  color: string | null;
  technician: string | null;
};

type DraftItem = {
  procedure_id: string;
  procedure_name: string;
  tooth_codes: string[];
  note: string;
};

const SEVERITY_STYLES: Record<string, string> = {
  critical:
    "border-red-600/70 bg-red-50 text-red-950 dark:bg-red-950/60 dark:text-red-50",
  warning:
    "border-amber-500/70 bg-amber-50 text-amber-950 dark:bg-amber-950/60 dark:text-amber-50",
  info: "border-primary/50 bg-accent text-accent-foreground",
};

const SEVERITY_ICONS: Record<string, typeof Info> = {
  critical: OctagonAlert,
  warning: AlertTriangle,
  info: Info,
};

/** Normalizează pentru căutare: litere mici, fără diacritice, fără punct (2.4 -> 24). */
function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(".", "");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Data locală de azi în format ISO (nu UTC — altfel după miezul nopții ar fi ziua precedentă). */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ToothChip({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">
      {formatTooth(code)}
    </span>
  );
}

// ---------- Componenta principală ----------

export function FisaClient({
  patient,
  alerts,
  sessions,
  toothStates,
  doctors: initialDoctors,
  categories,
  procedures: initialProcedures,
  prosthetics,
}: {
  patient: { id: string; first_name: string; last_name: string };
  alerts: Alert[];
  sessions: Session[];
  toothStates: { tooth_code: string; status: string; note: string | null }[];
  doctors: Doctor[];
  categories: Category[];
  procedures: Procedure[];
  prosthetics: Prosthetic[];
}) {
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [doctors, setDoctors] = useState(initialDoctors);
  const [procedures, setProcedures] = useState(initialProcedures);

  // Interacțiuni fișă
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toothFilter, setToothFilter] = useState<string[]>([]);
  const [toothDialog, setToothDialog] = useState<string | null>(null);
  const [lastClickedTooth, setLastClickedTooth] = useState<string | null>(null);

  // Formular ședință (nouă sau în editare)
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState(today());
  const [doctorId, setDoctorId] = useState<string>(initialDoctors[0]?.id ?? "");
  const [sessionNotes, setSessionNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [draftProcedureId, setDraftProcedureId] = useState("");
  const [draftTeeth, setDraftTeeth] = useState<string[]>([]);
  const [draftNote, setDraftNote] = useState("");

  const stateMap: ToothStateMap = useMemo(() => {
    const map: ToothStateMap = {};
    for (const t of toothStates) map[t.tooth_code] = t.status as ToothStatus;
    return map;
  }, [toothStates]);

  const expandedSession = sessions.find((s) => s.id === expandedId) ?? null;

  // Dinții evidențiați pe odontogramă
  const highlightedTeeth = useMemo(() => {
    if (formOpen) return draftTeeth;
    const teeth = new Set<string>(toothFilter);
    if (expandedSession) {
      for (const item of expandedSession.items) {
        for (const t of item.tooth_codes) teeth.add(t);
      }
    }
    return [...teeth];
  }, [formOpen, draftTeeth, expandedSession, toothFilter]);

  // Căutare text + filtru dinte
  const filteredSessions = useMemo(() => {
    const q = normalize(query.trim());
    let result = sessions;
    if (toothFilter.length > 0) {
      result = result.filter((s) =>
        s.items.some((item) =>
          item.tooth_codes.some((t) => toothFilter.includes(t))
        )
      );
    }
    if (q) {
      result = result
        .map((s) => {
          const matching = s.items.filter(
            (item) =>
              item.tooth_codes.some((t) => t.includes(q)) ||
              normalize(item.procedure?.name_ro ?? "").includes(q) ||
              normalize(item.note ?? "").includes(q)
          );
          return matching.length > 0 ? { ...s, items: matching } : null;
        })
        .filter((s): s is Session => s !== null);
    }
    return result;
  }, [sessions, query, toothFilter]);

  /**
   * Click pe dinte: toggle simplu; cu Shift selectează intervalul
   * de la ultimul dinte apăsat până la cel curent.
   */
  function handleToothClick(code: string, opts: { shiftKey: boolean }) {
    const apply = (prev: string[]): string[] => {
      if (opts.shiftKey && lastClickedTooth && lastClickedTooth !== code) {
        const a = ALL_TEETH.indexOf(lastClickedTooth);
        const b = ALL_TEETH.indexOf(code);
        const range = ALL_TEETH.slice(Math.min(a, b), Math.max(a, b) + 1);
        return [...new Set([...prev, ...range])];
      }
      return prev.includes(code)
        ? prev.filter((t) => t !== code)
        : [...prev, code];
    };

    if (formOpen) {
      setDraftTeeth(apply);
    } else {
      setToothFilter(apply);
      setExpandedId(null);
    }
    setLastClickedTooth(code);
  }

  /** Click pe zona goală a odontogramei — golește selecția curentă. */
  function handleChartBackgroundClick() {
    if (formOpen) {
      setDraftTeeth([]);
    } else {
      setToothFilter([]);
    }
    setLastClickedTooth(null);
  }

  function resetForm() {
    setFormOpen(false);
    setEditingId(null);
    setSessionDate(today());
    setSessionNotes("");
    setItems([]);
    setDraftProcedureId("");
    setDraftTeeth([]);
    setDraftNote("");
  }

  function startEdit(s: Session) {
    setEditingId(s.id);
    setSessionDate(s.session_date);
    setDoctorId(s.doctor?.id ?? initialDoctors[0]?.id ?? "");
    setSessionNotes(s.notes ?? "");
    setItems(
      s.items.map((item) => ({
        procedure_id: item.procedure?.id ?? "",
        procedure_name: item.procedure?.name_ro ?? "",
        tooth_codes: item.tooth_codes,
        note: item.note ?? "",
      }))
    );
    setToothFilter([]);
    setExpandedId(null);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addDraftItem() {
    const proc = procedures.find((p) => p.id === draftProcedureId);
    if (!proc) return;
    setItems((prev) => [
      ...prev,
      {
        procedure_id: proc.id,
        procedure_name: proc.name_ro,
        tooth_codes: [...draftTeeth].sort(),
        note: draftNote.trim(),
      },
    ]);
    setDraftProcedureId("");
    setDraftTeeth([]);
    setDraftNote("");
  }

  function saveSession() {
    const payload = {
      session_date: sessionDate,
      doctor_id: doctorId || null,
      notes: sessionNotes.trim() || null,
      items: items.map((i) => ({
        procedure_id: i.procedure_id,
        tooth_codes: i.tooth_codes,
        note: i.note || null,
      })),
    };
    startTransition(async () => {
      if (editingId) {
        await updateSession(patient.id, editingId, payload);
      } else {
        await addSession(patient.id, payload);
      }
      resetForm();
    });
  }

  return (
    <div className="space-y-8">
      {/* ---------- Alerte de sănătate ---------- */}
      <section className="space-y-2">
        {alerts.map((a) => {
          const Icon = SEVERITY_ICONS[a.severity] ?? Info;
          return (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border-l-4 border p-3.5 font-medium shadow-sm",
                SEVERITY_STYLES[a.severity] ?? SEVERITY_STYLES.info
              )}
              role="alert"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{a.message_ro}</span>
              <button
                onClick={() =>
                  startTransition(() => dismissAlert(patient.id, a.id))
                }
                title={ro.fisa.dismissAlert}
                className="rounded-md p-1 opacity-50 transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        <AddAlertDialog patientId={patient.id} />
      </section>

      {/* ---------- Oglinda dentară ---------- */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl">{ro.fisa.dentalChart}</h2>
          {toothFilter.length > 0 && !formOpen && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
              {ro.fisa.toothFilterLabel}{" "}
              {[...toothFilter]
                .sort((a, b) => ALL_TEETH.indexOf(a) - ALL_TEETH.indexOf(b))
                .map(formatTooth)
                .join(", ")}
              {toothFilter.length === 1 && (
                <button
                  onClick={() => setToothDialog(toothFilter[0])}
                  className="underline underline-offset-2 opacity-90 hover:opacity-100"
                >
                  {ro.fisa.toothDetails}
                </button>
              )}
              <button
                onClick={() => setToothFilter([])}
                className="rounded-full p-0.5 hover:bg-primary-foreground/20"
                title={ro.fisa.clearFilter}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {formOpen ? ro.fisa.selectTeeth : ro.fisa.chartHint}
        </p>
        <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
          <DentalChart
            states={stateMap}
            selected={highlightedTeeth}
            onToothClick={handleToothClick}
            onBackgroundClick={handleChartBackgroundClick}
          />
        </div>
      </section>

      {/* ---------- Ședințe ---------- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl">{ro.fisa.sessions}</h2>
          <Button
            variant={formOpen ? "outline" : "default"}
            onClick={() => (formOpen ? resetForm() : setFormOpen(true))}
          >
            {formOpen ? ro.patients.cancel : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                {ro.fisa.addSession}
              </>
            )}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={ro.fisa.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Formular ședință nouă / editare */}
        {formOpen && (
          <div className="rounded-2xl border-2 border-primary/25 bg-card p-4 shadow-sm space-y-4 sm:p-5">
            <h3 className="text-lg">
              {editingId ? ro.fisa.editSession : ro.fisa.addSession}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="session_date">{ro.fisa.sessionDate}</Label>
                <DateField
                  id="session_date"
                  value={sessionDate}
                  onChange={setSessionDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor">{ro.fisa.doctor}</Label>
                <div className="flex gap-2">
                  <select
                    id="doctor"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="h-8 flex-1 rounded-lg border border-border bg-background px-2 text-sm"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.full_name}
                      </option>
                    ))}
                  </select>
                  <AddDoctorDialog
                    onAdded={(d) => {
                      setDoctors((prev) => [...prev, d]);
                      setDoctorId(d.id);
                    }}
                  />
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm"
                  >
                    <span className="font-medium">{item.procedure_name}</span>
                    {item.tooth_codes.map((t) => (
                      <ToothChip key={t} code={t} />
                    ))}
                    {item.note && (
                      <span className="text-muted-foreground italic">
                        {item.note}
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setItems((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="ml-auto rounded-md p-1 opacity-50 hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-3 rounded-xl border border-dashed border-primary/30 p-3.5">
              <div className="flex gap-2">
                <select
                  value={draftProcedureId}
                  onChange={(e) => setDraftProcedureId(e.target.value)}
                  className="h-8 flex-1 rounded-lg border border-border bg-background px-2 text-sm"
                >
                  <option value="">{ro.fisa.selectProcedure}</option>
                  {categories.map((c) => (
                    <optgroup key={c.id} label={c.name_ro}>
                      {procedures
                        .filter((p) => p.category_id === c.id)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name_ro}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                <AddProcedureDialog
                  categories={categories}
                  onAdded={(p) => {
                    setProcedures((prev) =>
                      [...prev, p].sort((a, b) =>
                        a.name_ro.localeCompare(b.name_ro, "ro")
                      )
                    );
                    setDraftProcedureId(p.id);
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {ro.fisa.teeth}:{" "}
                {draftTeeth.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-1 align-middle">
                    {[...draftTeeth].sort().map((t) => (
                      <ToothChip key={t} code={t} />
                    ))}
                  </span>
                ) : (
                  ro.fisa.noTeeth
                )}
              </p>
              <Input
                placeholder={ro.fisa.itemNote}
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
              />
              <Button
                size="sm"
                variant="secondary"
                disabled={!draftProcedureId}
                onClick={addDraftItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                {ro.fisa.addItem}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_notes">{ro.fisa.sessionNotes}</Label>
              <textarea
                id="session_notes"
                rows={2}
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveSession}
                disabled={pending || items.length === 0}
              >
                {pending ? ro.common.loading : ro.patients.save}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                {ro.patients.cancel}
              </Button>
            </div>
          </div>
        )}

        {/* Lista ședințelor — carduri expandabile */}
        {filteredSessions.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            {sessions.length === 0 ? ro.fisa.noSessions : ro.fisa.noSearchResults}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {filteredSessions.map((s) => {
              const expanded = expandedId === s.id;
              return (
                <li
                  key={s.id}
                  className={cn(
                    "overflow-hidden rounded-xl border bg-card transition-all duration-200",
                    expanded
                      ? "border-primary/40 shadow-md"
                      : "shadow-sm hover:border-primary/25"
                  )}
                >
                  <button
                    onClick={() => {
                      setExpandedId(expanded ? null : s.id);
                      if (!expanded) setToothFilter([]);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="font-semibold whitespace-nowrap">
                      {fmtDate(s.session_date)}
                    </span>
                    {s.doctor && (
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground whitespace-nowrap">
                        {s.doctor.full_name}
                      </span>
                    )}
                    {!expanded && (
                      <span className="truncate text-sm text-muted-foreground">
                        {s.items
                          .map((i) => i.procedure?.name_ro)
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        expanded && "rotate-180"
                      )}
                    />
                  </button>

                  {expanded && (
                    <div className="space-y-3 border-t bg-muted/20 px-4 py-3.5">
                      <ul className="space-y-2">
                        {s.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-wrap items-center gap-2 text-sm"
                          >
                            <span className="font-medium">
                              {item.procedure?.name_ro}
                            </span>
                            {item.tooth_codes.map((t) => (
                              <ToothChip key={t} code={t} />
                            ))}
                            {item.note && (
                              <span className="text-muted-foreground italic">
                                {item.note}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                      {s.notes && (
                        <p className="whitespace-pre-wrap rounded-lg bg-secondary/60 px-3 py-2 text-sm text-secondary-foreground">
                          {s.notes}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(s)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          {ro.common.edit}
                        </Button>
                        <ReminderDialog patientId={patient.id} session={s} />
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() => {
                            if (confirm(ro.common.deleteConfirm)) {
                              startTransition(() =>
                                deleteSession(patient.id, s.id)
                              );
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                          {ro.common.delete}
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------- Lucrări protetice ---------- */}
      <ProstheticsSection patientId={patient.id} prosthetics={prosthetics} />

      {/* ---------- Dialog dinte ---------- */}
      <ToothDialog
        patientId={patient.id}
        toothCode={toothDialog}
        currentStatus={(toothDialog && stateMap[toothDialog]) || "healthy"}
        sessions={sessions}
        onClose={() => setToothDialog(null)}
      />
    </div>
  );
}

// ---------- Dialog reminder ----------

function ReminderDialog({
  patientId,
  session,
}: {
  patientId: string;
  session: Session;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("30");
  const [unit, setUnit] = useState<"days" | "months">("days");
  const [manualDate, setManualDate] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [pending, startTransition] = useTransition();

  const computedDate = useMemo(() => {
    const d = new Date(session.session_date);
    const n = parseInt(amount, 10) || 0;
    if (unit === "months") {
      d.setMonth(d.getMonth() + n);
    } else {
      d.setDate(d.getDate() + n);
    }
    return d.toISOString().slice(0, 10);
  }, [session.session_date, amount, unit]);

  // Data aleasă manual are prioritate; modificarea intervalului o recalculează
  const dueDate = manualDate ?? computedDate;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <BellPlus className="h-3.5 w-3.5 mr-1.5" />
        {ro.reminders.add}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ro.reminders.add}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="rem_amount">{ro.reminders.interval}</Label>
                <div className="flex gap-1.5">
                  <Input
                    id="rem_amount"
                    type="number"
                    min={1}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setManualDate(null);
                    }}
                    className="w-20"
                  />
                  <select
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value as "days" | "months");
                      setManualDate(null);
                    }}
                    className="h-8 flex-1 rounded-lg border border-border bg-background px-2 text-sm"
                    aria-label={ro.reminders.unit}
                  >
                    <option value="days">{ro.reminders.unitDays}</option>
                    <option value="months">{ro.reminders.unitMonths}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rem_date">{ro.reminders.dueDate}</Label>
                <DateField
                  id="rem_date"
                  value={dueDate}
                  min={session.session_date}
                  onChange={(v) => setManualDate(v || null)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rem_msg">{ro.reminders.message}</Label>
              <textarea
                id="rem_msg"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={notifyPatient}
                onChange={(e) => setNotifyPatient(e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              {ro.reminders.notifyPatient}
            </label>
            <Button
              disabled={pending || !message.trim()}
              onClick={() =>
                startTransition(async () => {
                  await addReminder(
                    patientId,
                    session.id,
                    dueDate,
                    message,
                    notifyPatient
                  );
                  setMessage("");
                  setOpen(false);
                })
              }
            >
              {pending ? ro.common.loading : ro.patients.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Dialog alertă nouă ----------

function AddAlertDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical">("warning");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        {ro.fisa.addAlert}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ro.fisa.addAlert}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="alert_msg">{ro.fisa.alertMessage}</Label>
              <textarea
                id="alert_msg"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert_sev">{ro.fisa.severity}</Label>
              <select
                id="alert_sev"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as typeof severity)}
                className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                <option value="info">{ro.fisa.severityInfo}</option>
                <option value="warning">{ro.fisa.severityWarning}</option>
                <option value="critical">{ro.fisa.severityCritical}</option>
              </select>
            </div>
            <Button
              disabled={pending || !message.trim()}
              onClick={() =>
                startTransition(async () => {
                  await addAlert(patientId, message, severity);
                  setMessage("");
                  setOpen(false);
                })
              }
            >
              {pending ? ro.common.loading : ro.patients.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Dialog medic nou ----------

function AddDoctorDialog({ onAdded }: { onAdded: (d: Doctor) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        title={ro.fisa.addDoctor}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ro.fisa.addDoctor}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="doctor_name">{ro.fisa.doctorName}</Label>
              <Input
                id="doctor_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button
              disabled={pending || !name.trim()}
              onClick={() =>
                startTransition(async () => {
                  const d = await addDoctor(name);
                  onAdded(d);
                  setName("");
                  setOpen(false);
                })
              }
            >
              {pending ? ro.common.loading : ro.patients.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Dialog manoperă nouă ----------

function AddProcedureDialog({
  categories,
  onAdded,
}: {
  categories: Category[];
  onAdded: (p: Procedure) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        title={ro.fisa.addProcedure}
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{ro.fisa.addProcedure}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="proc_name">{ro.fisa.procedureName}</Label>
              <Input
                id="proc_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proc_cat">{ro.fisa.category}</Label>
              <select
                id="proc_cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-background px-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_ro}
                  </option>
                ))}
              </select>
            </div>
            <Button
              disabled={pending || !name.trim() || !categoryId}
              onClick={() =>
                startTransition(async () => {
                  const p = await addProcedure(name, categoryId);
                  onAdded(p);
                  setName("");
                  setOpen(false);
                })
              }
            >
              {pending ? ro.common.loading : ro.patients.save}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---------- Dialog dinte (istoric + stare) ----------

const TOOTH_STATUSES: ToothStatus[] = [
  "healthy",
  "caries",
  "filling",
  "endo_treated",
  "veneer",
  "crown",
  "bridge_pontic",
  "implant",
  "denture",
  "to_extract",
  "missing",
];

function ToothDialog({
  patientId,
  toothCode,
  currentStatus,
  sessions,
  onClose,
}: {
  patientId: string;
  toothCode: string | null;
  currentStatus: ToothStatus;
  sessions: Session[];
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const history = useMemo(() => {
    if (!toothCode) return [];
    const entries: { date: string; procedure: string; note: string | null }[] = [];
    for (const s of sessions) {
      for (const item of s.items) {
        if (item.tooth_codes.includes(toothCode)) {
          entries.push({
            date: s.session_date,
            procedure: item.procedure?.name_ro ?? "",
            note: item.note,
          });
        }
      }
    }
    return entries;
  }, [sessions, toothCode]);

  return (
    <Dialog open={toothCode !== null} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {ro.fisa.toothHistory}: {toothCode ? formatTooth(toothCode) : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{ro.fisa.toothStatus}</Label>
            <div className="flex flex-wrap gap-1.5">
              {TOOTH_STATUSES.map((s) => (
                <Button
                  key={s}
                  size="xs"
                  variant={s === currentStatus ? "default" : "outline"}
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      if (toothCode) {
                        await setToothState(patientId, toothCode, s, null);
                      }
                      onClose();
                    })
                  }
                >
                  {ro.fisa.statusLabels[s]}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{ro.fisa.sessions}</Label>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">{ro.fisa.noHistory}</p>
            ) : (
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {history.map((h, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-muted-foreground shrink-0">
                      {new Date(h.date).toLocaleDateString("ro-RO")}
                    </span>
                    <span>{h.procedure}</span>
                    {h.note && (
                      <span className="text-muted-foreground italic">{h.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Lucrări protetice ----------

function ProstheticsSection({
  patientId,
  prosthetics,
}: {
  patientId: string;
  prosthetics: Prosthetic[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    work_date: today(),
    plan: "",
    material: "",
    color: "",
    technician: "",
  });

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl">{ro.fisa.prosthetics}</h2>
        <Button
          variant={formOpen ? "outline" : "default"}
          onClick={() => setFormOpen((v) => !v)}
        >
          {formOpen ? ro.patients.cancel : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              {ro.fisa.addProsthetic}
            </>
          )}
        </Button>
      </div>

      {formOpen && (
        <div className="rounded-2xl border-2 border-primary/25 bg-card p-4 shadow-sm grid gap-3 sm:grid-cols-2 sm:p-5">
          <div className="space-y-2">
            <Label>{ro.fisa.sessionDate}</Label>
            <DateField
              value={form.work_date}
              onChange={(v) => set("work_date", v)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ro.fisa.prostheticPlan}</Label>
            <Input
              value={form.plan}
              onChange={(e) => set("plan", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ro.fisa.prostheticMaterial}</Label>
            <Input
              value={form.material}
              onChange={(e) => set("material", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ro.fisa.prostheticColor}</Label>
            <Input
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ro.fisa.prostheticTechnician}</Label>
            <Input
              value={form.technician}
              onChange={(e) => set("technician", e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await addProstheticWork(patientId, {
                    work_date: form.work_date,
                    plan: form.plan.trim() || null,
                    material: form.material.trim() || null,
                    color: form.color.trim() || null,
                    technician: form.technician.trim() || null,
                  });
                  setFormOpen(false);
                  setForm({
                    work_date: today(),
                    plan: "",
                    material: "",
                    color: "",
                    technician: "",
                  });
                })
              }
            >
              {pending ? ro.common.loading : ro.patients.save}
            </Button>
          </div>
        </div>
      )}

      {prosthetics.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground">
          {ro.fisa.noProsthetics}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">{ro.fisa.sessionDate}</th>
                <th className="px-4 py-2.5 font-medium">{ro.fisa.prostheticPlan}</th>
                <th className="px-4 py-2.5 font-medium">{ro.fisa.prostheticMaterial}</th>
                <th className="px-4 py-2.5 font-medium">{ro.fisa.prostheticColor}</th>
                <th className="px-4 py-2.5 font-medium">{ro.fisa.prostheticTechnician}</th>
              </tr>
            </thead>
            <tbody>
              {prosthetics.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {new Date(p.work_date).toLocaleDateString("ro-RO")}
                  </td>
                  <td className="px-4 py-2.5">{p.plan}</td>
                  <td className="px-4 py-2.5">{p.material}</td>
                  <td className="px-4 py-2.5">{p.color}</td>
                  <td className="px-4 py-2.5">{p.technician}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
