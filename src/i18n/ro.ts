/**
 * Dicționarul de texte UI în română.
 * Toate string-urile vizibile în aplicație vin de aici.
 */
export const ro = {
  app: {
    name: "Patient Hub",
    clinicName: "Cabinet Stomatologic Dr. Oana Vlad",
  },
  auth: {
    login: "Autentificare",
    email: "Email",
    password: "Parolă",
    signIn: "Intră în cont",
    signOut: "Deconectare",
    invalidCredentials: "Email sau parolă incorecte.",
  },
  nav: {
    dashboard: "Acasă",
    patients: "Pacienți",
    agenda: "Agendă",
    settings: "Setări",
  },
  patients: {
    title: "Pacienți",
    search: "Caută pacient...",
    add: "Adaugă pacient",
    empty: "Niciun pacient încă. Adaugă primul pacient.",
    noResults: "Niciun pacient găsit.",
    firstName: "Prenume",
    lastName: "Nume",
    birthDate: "Data nașterii",
    phone: "Telefon",
    email: "Email",
    address: "Adresa",
    occupation: "Ocupație / Loc de muncă",
    familyHistory: "Antecedente heredo-colaterale",
    personalHistory: "Antecedente personale patologice",
    notes: "Notițe",
    save: "Salvează",
    cancel: "Anulează",
  },
  patientHub: {
    chestionare: "Chestionare",
    planTratament: "Plan de tratament",
    fisaTratament: "Fișa de tratament",
    fotografii: "Fotografii",
    radiografii: "Radiografii",
  },
  common: {
    loading: "Se încarcă...",
    error: "A apărut o eroare. Încearcă din nou.",
    delete: "Șterge",
    edit: "Editează",
    back: "Înapoi",
    comingSoon: "În curând",
  },
} as const;

export type RoDict = typeof ro;
