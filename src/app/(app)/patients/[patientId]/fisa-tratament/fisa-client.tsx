"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Info,
  OctagonAlert,
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
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
  addSession,
  deleteSession,
  dismissAlert,
  setToothState,
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
    "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  warning:
    "border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  info: "border-blue-400 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
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
  return new Date(iso).toLocaleDateString("ro-RO");
}

function today() {
  return new Date().toISOString().slice(0, 10);
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

  // Formular ședință nouă
  const [formOpen, setFormOpen] = useState(false);
  const [sessionDate, setSessionDate] = useState(today());
  const [doctorId, setDoctorId] = useState<string>(initialDoctors[0]?.id ?? "");
  const [sessionNotes, setSessionNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [draftProcedureId, setDraftProcedureId] = useState("");
  const [draftTeeth, setDraftTeeth] = useState<string[]>([]);
  const [draftNote, setDraftNote] = useState("");

  // Dialog dinte
  const [toothDialog, setToothDialog] = useState<string | null>(null);

  const stateMap: ToothStateMap = useMemo(() => {
    const map: ToothStateMap = {};
    for (const t of toothStates) map[t.tooth_code] = t.status as ToothStatus;
    return map;
  }, [toothStates]);

  // Căutare: după dinte ("24"/"2.4") sau manoperă/notiță
  const filteredSessions = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return sessions;
    return sessions
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
  }, [sessions, query]);

  function handleToothClick(code: string) {
    if (formOpen) {
      setDraftTeeth((prev) =>
        prev.includes(code) ? prev.filter((t) => t !== code) : [...prev, code]
      );
    } else {
      setToothDialog(code);
    }
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
    startTransition(async () => {
      await addSession(patient.id, {
        session_date: sessionDate,
        doctor_id: doctorId || null,
        notes: sessionNotes.trim() || null,
        items: items.map((i) => ({
          procedure_id: i.procedure_id,
          tooth_codes: i.tooth_codes,
          note: i.note || null,
        })),
      });
      setFormOpen(false);
      setSessionDate(today());
      setSessionNotes("");
      setItems([]);
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold">
        {ro.fisa.title}: {patient.last_name} {patient.first_name}
      </h1>

      {/* ---------- Alerte de sănătate ---------- */}
      <section className="space-y-2">
        {alerts.map((a) => {
          const Icon = SEVERITY_ICONS[a.severity] ?? Info;
          return (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border-l-4 border p-3 font-medium",
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
                className="opacity-60 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
        <AddAlertDialog patientId={patient.id} />
      </section>

      {/* ---------- Oglinda dentară ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>{ro.fisa.dentalChart}</CardTitle>
          {formOpen && (
            <p className="text-sm text-muted-foreground">
              {ro.fisa.selectTeeth}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <DentalChart
            states={stateMap}
            selected={formOpen ? draftTeeth : []}
            onToothClick={handleToothClick}
          />
        </CardContent>
      </Card>

      {/* ---------- Ședințe ---------- */}
      <Card>
        <CardHeader className="gap-3">
          <div className="flex items-center justify-between">
            <CardTitle>{ro.fisa.sessions}</CardTitle>
            <Button
              size="sm"
              variant={formOpen ? "outline" : "default"}
              onClick={() => setFormOpen((v) => !v)}
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
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formular ședință nouă */}
          {formOpen && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session_date">{ro.fisa.sessionDate}</Label>
                  <Input
                    id="session_date"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
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

              {/* Manopere adăugate la ședință */}
              {items.length > 0 && (
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 rounded-md bg-background border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{item.procedure_name}</span>
                      {item.tooth_codes.length > 0 && (
                        <span className="text-muted-foreground">
                          {item.tooth_codes.map(formatTooth).join(", ")}
                        </span>
                      )}
                      {item.note && (
                        <span className="text-muted-foreground italic truncate">
                          {item.note}
                        </span>
                      )}
                      <button
                        onClick={() =>
                          setItems((prev) => prev.filter((_, j) => j !== i))
                        }
                        className="ml-auto opacity-60 hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Manoperă nouă în lucru */}
              <div className="space-y-3 rounded-md border border-dashed p-3">
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
                  {draftTeeth.length > 0
                    ? [...draftTeeth].sort().map(formatTooth).join(", ")
                    : ro.fisa.noTeeth}{" "}
                  — {ro.fisa.selectTeeth.toLowerCase()}
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

              <Button
                onClick={saveSession}
                disabled={pending || items.length === 0}
              >
                {pending ? ro.common.loading : ro.patients.save}
              </Button>
            </div>
          )}

          {/* Lista ședințelor */}
          {filteredSessions.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              {sessions.length === 0 ? ro.fisa.noSessions : ro.fisa.noSearchResults}
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredSessions.map((s) => (
                <li key={s.id} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{fmtDate(s.session_date)}</span>
                    {s.doctor && (
                      <Badge variant="secondary">{s.doctor.full_name}</Badge>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(ro.common.deleteConfirm)) {
                          startTransition(() =>
                            deleteSession(patient.id, s.id)
                          );
                        }
                      }}
                      className="ml-auto text-muted-foreground hover:text-destructive"
                      title={ro.common.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {s.items.map((item) => (
                      <li key={item.id} className="flex flex-wrap items-center gap-2 text-sm">
                        <span>{item.procedure?.name_ro}</span>
                        {item.tooth_codes.length > 0 && (
                          <span className="font-mono text-primary">
                            {item.tooth_codes.map(formatTooth).join(", ")}
                          </span>
                        )}
                        {item.note && (
                          <span className="text-muted-foreground italic">
                            {item.note}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {s.notes && (
                    <p className="text-sm text-muted-foreground">{s.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ---------- Lucrări protetice ---------- */}
      <ProstheticsCard patientId={patient.id} prosthetics={prosthetics} />

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
                      {fmtDate(h.date)}
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

function ProstheticsCard({
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
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{ro.fisa.prosthetics}</CardTitle>
        <Button
          size="sm"
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
      </CardHeader>
      <CardContent className="space-y-4">
        {formOpen && (
          <div className="rounded-lg border bg-muted/30 p-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{ro.fisa.sessionDate}</Label>
              <Input
                type="date"
                value={form.work_date}
                onChange={(e) => set("work_date", e.target.value)}
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
          <p className="py-4 text-center text-muted-foreground">
            {ro.fisa.noProsthetics}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">{ro.fisa.sessionDate}</th>
                  <th className="py-2 pr-3 font-medium">{ro.fisa.prostheticPlan}</th>
                  <th className="py-2 pr-3 font-medium">{ro.fisa.prostheticMaterial}</th>
                  <th className="py-2 pr-3 font-medium">{ro.fisa.prostheticColor}</th>
                  <th className="py-2 font-medium">{ro.fisa.prostheticTechnician}</th>
                </tr>
              </thead>
              <tbody>
                {prosthetics.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 whitespace-nowrap">{fmtDate(p.work_date)}</td>
                    <td className="py-2 pr-3">{p.plan}</td>
                    <td className="py-2 pr-3">{p.material}</td>
                    <td className="py-2 pr-3">{p.color}</td>
                    <td className="py-2">{p.technician}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
