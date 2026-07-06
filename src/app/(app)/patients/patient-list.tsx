"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { ro } from "@/i18n/ro";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type PatientRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  birth_date: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ro-RO");
}

export function PatientList({ patients }: { patients: PatientRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) =>
      `${p.last_name} ${p.first_name} ${p.phone ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [patients, query]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={ro.patients.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button nativeButton={false} render={<Link href="/patients/new" />}>
          <UserPlus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">{ro.patients.add}</span>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {patients.length === 0 ? ro.patients.empty : ro.patients.noResults}
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {filtered.map((p) => (
            <Link
              key={p.id}
              href={`/patients/${p.id}`}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50"
            >
              <div>
                <p className="font-medium">
                  {p.last_name} {p.first_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(p.birth_date)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{p.phone ?? ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
