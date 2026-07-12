import type { SVGProps } from "react";

/**
 * Iconiță de dinte (molar), în stilul liniar lucide-react.
 * Folosită pentru secțiunea „Fișa de tratament".
 */
export function ToothIcon({
  strokeWidth = 2,
  ...props
}: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 5.5c-1.4-1.2-3-2-4.6-2C5 3.5 3.5 5.3 3.5 7.8c0 1.6.5 2.8.9 4.3.3 1.2.3 2.5.5 3.8.2 1.4.5 3.6 1.6 4.4.9.7 1.7-.3 1.9-1.2.3-1.3.5-2.7.9-4 .2-.6.5-1.3 1.2-1.3s1 .7 1.2 1.3c.4 1.3.6 2.7.9 4 .2.9 1 1.9 1.9 1.2 1.1-.8 1.4-3 1.6-4.4.2-1.3.2-2.6.5-3.8.4-1.5.9-2.7.9-4.3 0-2.5-1.5-4.3-3.9-4.3-1.6 0-3.2.8-4.6 2Z" />
    </svg>
  );
}
