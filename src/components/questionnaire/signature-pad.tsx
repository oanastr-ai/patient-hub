"use client";

import { useEffect, useRef } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Zonă de semnătură pentru deget, stylus sau mouse. Semnătura se trimite
 * părintelui ca PNG (data URL) după fiecare trăsătură; `null` = goală.
 */
export function SignaturePad({
  onChange,
  clearLabel,
  placeholder,
}: {
  onChange: (dataUrl: string | null) => void;
  clearLabel: string;
  placeholder: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const placeholderRef = useRef<HTMLSpanElement>(null);

  // Rezoluția internă urmează dimensiunea afișată, ca linia să fie clară pe ecrane dense.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const resize = () => {
      if (hasInk.current) return; // nu șterge o semnătură deja desenată
      const ratio = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext("2d")!;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#1c2a3a";
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    // Un punct simplu, ca o atingere scurtă să lase urmă.
    const ctx = e.currentTarget.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(last.current.x, last.current.y, 1.1, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    if (placeholderRef.current) placeholderRef.current.style.opacity = "0";
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    const ctx = e.currentTarget.getContext("2d")!;
    const p = point(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    hasInk.current = true;
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    hasInk.current = true;
    onChange(canvasRef.current!.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    hasInk.current = false;
    if (placeholderRef.current) placeholderRef.current.style.opacity = "1";
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-xl border-2 border-dashed border-primary/40 bg-white">
        <canvas
          ref={canvasRef}
          className="block h-48 w-full cursor-crosshair touch-none sm:h-56"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
        <span
          ref={placeholderRef}
          className="pointer-events-none absolute inset-0 flex items-center justify-center text-muted-foreground/70 transition-opacity"
        >
          {placeholder}
        </span>
        <div className="pointer-events-none absolute inset-x-8 bottom-10 border-b border-muted-foreground/30" />
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          <Eraser className="mr-1.5" />
          {clearLabel}
        </Button>
      </div>
    </div>
  );
}
