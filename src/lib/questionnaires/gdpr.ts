import type { Field, QuestionnaireTemplate } from "./types";

/**
 * „Notă de informare și acord privind prelucrarea datelor cu caracter
 * personal" — transcrisă din sample-files/Acord_GDPR_cabinet_stomatologic.pdf.
 *
 * La semnare se completează și `patients.gdpr_consent_at`.
 *
 * La orice schimbare de text se crește `version`, iar versiunea veche se
 * păstrează dacă există acorduri semnate pe ea.
 */

function optional(id: string, label: string): Field {
  return { kind: "yesno", id, label };
}

export const gdpr: QuestionnaireTemplate = {
  code: "gdpr",
  version: 1,
  title: "Notă de informare și acord privind prelucrarea datelor cu caracter personal",
  shortTitle: "Acord GDPR",
  summary: false,
  recordsGdprConsent: true,
  sections: [
    {
      text: ["În conformitate cu Regulamentul (UE) 2016/679 (GDPR) și Legea nr. 190/2018."],
      fields: [
        { kind: "text", id: "pacient_nume", label: "Nume și prenume pacient", required: true },
        { kind: "text", id: "cnp", label: "CNP", short: true },
        { kind: "text", id: "adresa", label: "Adresa" },
        { kind: "text", id: "telefon", label: "Telefon", short: true },
        { kind: "text", id: "email", label: "E-mail" },
        {
          kind: "yesno",
          id: "reprezentant",
          label: "Reprezentant legal (pentru minori / persoane fără discernământ)?",
          followUp: [
            { kind: "text", id: "reprezentant_nume", label: "Numele și prenumele reprezentantului", required: true },
            { kind: "text", id: "reprezentant_calitate", label: "Calitatea (părinte, tutore etc.)", required: true },
            { kind: "text", id: "reprezentant_cnp", label: "CNP reprezentant", short: true },
          ],
        },
      ],
    },
    {
      title: "1. Operatorul de date",
      text: [
        "Datele dumneavoastră sunt prelucrate de dr. Oana Maria Vlad, medic stomatolog, în calitate de operator de date cu caracter personal.",
        "E-mail de contact: office@dr-oanavlad.com",
      ],
    },
    {
      title: "2. Ce date prelucrăm",
      text: [
        {
          list: [
            "Date de identificare și contact: nume, prenume, CNP, data nașterii, adresă, telefon, e-mail;",
            "Date privind sănătatea: anamneza (chestionarul de stare generală), afecțiuni, alergii, medicație, diagnostic, plan și tratamente efectuate, radiografii, CBCT, fotografii intra- și extraorale, amprente și scanări digitale;",
            "Date financiare: servicii efectuate, plăți, facturi / chitanțe.",
          ],
        },
      ],
    },
    {
      title: "3. Scopurile și temeiul legal al prelucrării",
      text: [
        {
          list: [
            "Acordarea asistenței medicale stomatologice (examinare, diagnostic, tratament, completarea fișei pacientului) – art. 6 alin. (1) lit. b) și c) și art. 9 alin. (2) lit. h) GDPR, Legea nr. 46/2003 privind drepturile pacientului și Legea nr. 95/2006 privind reforma în domeniul sănătății. Pentru acest scop nu este necesar consimțământul dumneavoastră; fără aceste date însă tratamentul nu poate fi realizat în siguranță.",
            "Programări, anunțarea modificărilor de programare și reamintiri pentru controalele periodice (telefon, SMS, WhatsApp, e-mail) – art. 6 alin. (1) lit. b) și f) GDPR.",
            "Îndeplinirea obligațiilor legale fiscale, contabile și de raportare către autorități – art. 6 alin. (1) lit. c) GDPR.",
            "Constatarea, exercitarea sau apărarea unor drepturi în instanță – art. 9 alin. (2) lit. f) GDPR.",
            "Scopuri opționale, numai cu acordul dumneavoastră (secțiunea 9) – art. 6 alin. (1) lit. a) și art. 9 alin. (2) lit. a) GDPR.",
          ],
        },
      ],
    },
    {
      title: "4. Cui pot fi comunicate datele",
      text: [
        "Numai în măsura necesară: laboratoare de tehnică dentară, centre de radiologie și imagistică, alți medici la care sunteți îndrumat(ă), furnizori de software medical, programări și servicii IT, contabil, asigurători / Casa de Asigurări de Sănătate (dacă este cazul), precum și autorități publice, la cererea lor legală. Toți aceștia au obligația de a păstra confidențialitatea datelor. Datele nu sunt transferate în afara Spațiului Economic European decât cu garanțiile prevăzute de capitolul V din GDPR.",
      ],
    },
    {
      title: "5. Cât timp păstrăm datele",
      text: [
        "Documentele medicale (fișa pacientului, radiografii, consimțăminte) se păstrează pe durata prevăzută de legislația privind documentele medicale; documentele financiar-contabile, pe durata prevăzută de legislația contabilă și fiscală. Datele prelucrate pe baza consimțământului se păstrează până la retragerea acestuia. La expirarea termenelor, datele sunt șterse sau anonimizate.",
      ],
    },
    {
      title: "6. Confidențialitate și securitate",
      text: [
        "Datele sunt protejate de secretul profesional medical și de măsuri tehnice și organizatorice adecvate (acces restricționat, parole, copii de siguranță, arhivare securizată). CNP-ul este prelucrat în condițiile art. 4 din Legea nr. 190/2018.",
      ],
    },
    {
      title: "7. Drepturile dumneavoastră",
      text: [
        "Aveți dreptul de acces la date, de rectificare, de ștergere (în limitele obligațiilor legale de păstrare a documentelor medicale), de restricționare a prelucrării, la portabilitatea datelor, de opoziție și dreptul de a vă retrage oricând consimțământul, fără a afecta legalitatea prelucrării efectuate anterior. Puteți obține gratuit o copie a fișei medicale și a radiografiilor. Cererile se depun în scris, la adresa de e-mail de la punctul 1 sau la cabinet, și primesc răspuns în cel mult o lună. Puteți depune plângere la ANSPDCP (www.dataprotection.ro).",
      ],
    },
    {
      title: "8. Declarație",
      text: [
        "Declar că am citit și am înțeles prezenta notă de informare, că datele furnizate sunt reale și că voi anunța orice modificare a acestora sau a stării mele de sănătate.",
      ],
    },
    {
      title: "9. Acorduri opționale",
      text: ["Refuzul nu afectează în niciun fel tratamentul. Acordul poate fi retras oricând, în scris."],
      fields: [
        optional(
          "didactic",
          "Folosirea radiografiilor și fotografiilor mele anonimizate (fără nume și fără ca fața să fie recunoscută) în scop didactic și științific (cursuri, congrese, publicații de specialitate)."
        ),
        optional(
          "foto_dentare",
          "Publicarea fotografiilor dentare fără elemente de identificare (zâmbet, dinți, înainte/după) pe site-ul și rețelele de socializare ale cabinetului."
        ),
        optional(
          "foto_fata",
          "Publicarea fotografiilor / videoclipurilor în care fața mea este vizibilă, pe site-ul și rețelele de socializare ale cabinetului."
        ),
      ],
    },
  ],
  declaration: [],
  signatureLabel: "Semnătura pacientului / reprezentantului legal",
  prefill: ({ patientName, cnp, address, phone, email }) => ({
    pacient_nume: patientName,
    reprezentant: "nu",
    ...(cnp ? { cnp } : {}),
    ...(address ? { adresa: address } : {}),
    ...(phone ? { telefon: phone } : {}),
    ...(email ? { email } : {}),
  }),
};
