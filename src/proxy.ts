import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toate rutele, mai puțin fișierele statice, imaginile și manifestul PWA.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
