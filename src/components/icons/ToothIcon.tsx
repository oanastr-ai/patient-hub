import type { SVGProps } from "react";

/**
 * Iconiță de dinte (molar), în stilul liniar lucide-react.
 * Folosită pentru secțiunea „Fișa de tratament".
 */
export function ToothIcon({
  strokeWidth = 1.4,
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
      <path d="M12 6C10.6 4 7.8 3 5.9 5 4.4 6.6 4.5 8.6 4.8 10.4c.3 1.6.4 2.4.8 3.8.4 1.6.4 4.3 1.3 6 .8 1.5 1.9.3 2.3-1.7.4-1.9.6-2.9 2.8-2.9s2.4 1 2.8 2.9c.4 2 1.5 3.2 2.3 1.7.9-1.7.9-4.4 1.3-6 .4-1.4.5-2.2.8-3.8.3-1.8.4-3.8-1.1-5.4C16.2 3 13.4 4 12 6Z" />
    </svg>
  );
}
