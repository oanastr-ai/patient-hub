"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Câmp de dată cu afișare românească (zz.ll.aaaa).
 * Peste afișaj stă un <input type="date"> invizibil care deschide
 * calendarul nativ la click/tap.
 *
 * Suportă mod controlat (value + onChange) sau necontrolat
 * (defaultValue + name, pentru formulare cu FormData).
 */
export function DateField({
  id,
  name,
  value,
  defaultValue,
  onChange,
  min,
  max,
  required,
  className,
}: {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  className?: string;
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = controlled ? value : inner;

  const display = current
    ? new Date(current + "T00:00:00").toLocaleDateString("ro-RO")
    : "";

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className={cn(
          "flex h-8 w-full items-center rounded-lg border border-border bg-background px-2.5 pr-8 text-sm",
          !display && "text-muted-foreground"
        )}
      >
        {display || "zz.ll.aaaa"}
      </div>
      <CalendarDays className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="date"
        id={id}
        name={name}
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : defaultValue}
        min={min}
        max={max}
        required={required}
        onChange={(e) => {
          if (!controlled) setInner(e.target.value);
          onChange?.(e.target.value);
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        tabIndex={0}
      />
    </div>
  );
}
