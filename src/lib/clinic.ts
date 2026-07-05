import { createClient } from "@/lib/supabase/server";

/** Returnează clinic_id al utilizatorului autentificat. */
export async function getClinicId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Neautentificat");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("clinic_id")
    .eq("id", user.id)
    .single();
  if (error || !profile) throw new Error("Profil inexistent");

  return profile.clinic_id;
}
