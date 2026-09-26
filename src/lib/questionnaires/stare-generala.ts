import type { Field, Option, QuestionnaireTemplate } from "./types";

/**
 * „II. Chestionar de evaluare a stării generale" — transcris din
 * sample-files/Chestionar_evaluare_stare_generala.pdf.
 *
 * La orice schimbare de text sau de structură se crește `version`, iar
 * versiunea veche se păstrează dacă există răspunsuri salvate pe ea.
 */

const NOTE_FERTILE =
  "Se completează doar de persoanele de sex feminin aflate la vârsta fertilă (14–55 de ani).";

function opts(...pairs: [string, string, string?][]): Option[] {
  return pairs.map(([id, label, detail]) => ({ id, label, detail }));
}

/** Grupele de boli de sub „Suferiți sau ați suferit de vreo boală…". */
const diseaseGroups: Field[] = [
  { kind: "text", id: "boli_congenitale", label: "Boli congenitale" },
  { kind: "text", id: "boli_profesionale", label: "Boli profesionale" },
  {
    kind: "checks",
    id: "boli_inima",
    label: "Boli de inimă",
    alert: true,
    options: opts(
      ["angina", "angină pectorală"],
      ["infarct", "infarct miocardic", "Când?"],
      ["aritmii", "aritmii (fibrilație etc.)"],
      ["blocuri", "blocuri"],
      ["insuficienta", "insuficiență cardiacă", "Clasa NYHA"],
      ["valvulopatii", "valvulopatii", "Care?"],
      ["endocardita", "endocardită infecțioasă"],
      ["chirurgie", "intervenții chirurgicale cardiace", "Precizați"]
    ),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_vasculare",
    label: "Boli vasculare",
    alert: true,
    options: opts(
      ["arteriopatie", "arteriopatie obliterantă"],
      ["tromboflebita", "tromboflebită"],
      ["hipotensiune", "hipotensiune arterială"],
      ["hipertensiune", "hipertensiune arterială", "Cea mai mare valoare tensională avută (mmHg)"],
      ["avc", "accident vascular cerebral", "Când?"]
    ),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_respiratorii",
    label: "Boli ale aparatului respirator",
    options: opts(
      ["astm", "astm bronșic"],
      ["emfizem", "emfizem"],
      ["bronsita", "bronșită cronică"],
      ["tbc", "TBC", "Ați urmat tratament?"]
    ),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_digestive",
    label: "Boli digestive",
    options: opts(["gastrita", "gastrite / ulcer gastroduodenal"]),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_hepatice",
    label: "Boli hepatice",
    options: opts(
      ["steatoza", "steatoză hepatică"],
      ["hepatita_cronica", "hepatită cronică"],
      ["ciroza", "ciroză"]
    ),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_renale",
    label: "Boli renale",
    options: opts(["insuficienta_renala", "insuficiență renală", "Urmați hemodializă?"]),
  },
  {
    kind: "checks",
    id: "diabet",
    label: "Diabet",
    alert: true,
    options: opts(
      ["insulina", "tratament cu insulină"],
      ["antidiabetice", "tratament cu antidiabetice orale"]
    ),
  },
  {
    kind: "checks",
    id: "boli_endocrine",
    label: "Boli endocrine",
    options: opts(["hipotiroidie", "hipotiroidie"], ["hipertiroidie", "hipertiroidie"]),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_reumatismale",
    label: "Boli reumatismale",
    options: opts(
      ["poliartrita", "poliartrită reumatoidă"],
      ["colagenoze", "colagenoze"]
    ),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_scheletale",
    label: "Boli scheletale",
    options: opts(["osteoporoza", "osteoporoză"]),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_neurologice",
    label: "Boli neurologice",
    alert: true,
    options: opts(["epilepsie", "epilepsie"]),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_psihice",
    label: "Boli psihice",
    options: opts(["depresie", "depresie"], ["schizofrenie", "schizofrenie"]),
    other: "altele",
  },
  {
    kind: "checks",
    id: "neurovegetative",
    label: "Manifestări neurovegetative",
    options: opts(["atacuri_panica", "atacuri de panică"]),
  },
  {
    kind: "checks",
    id: "boli_hematologice",
    label: "Boli hematologice",
    alert: true,
    options: opts(
      ["anemie", "anemie"],
      ["thalasemie", "talasemie"],
      ["leucemie_acuta", "leucemie acută"],
      ["leucemie_cronica", "leucemie cronică"],
      ["hemofilie", "hemofilie"],
      ["trombocitopenie", "trombocitopenie"],
      ["von_willebrand", "boala von Willebrand"]
    ),
    other: "altele",
  },
  {
    kind: "checks",
    id: "boli_infectioase",
    label: "Boli infecțioase",
    alert: true,
    options: opts(
      ["hepatita_b", "hepatită virală B"],
      ["hepatita_c", "hepatită virală C"],
      ["hepatita_d", "hepatită virală D"],
      ["hiv", "HIV"]
    ),
    other: "altele",
  },
  { kind: "text", id: "neoplasme", label: "Neoplasme", alert: true },
  { kind: "text", id: "alte_boli", label: "Alte boli" },
];

export const stareGenerala: QuestionnaireTemplate = {
  code: "stare-generala",
  version: 1,
  title: "Chestionar de evaluare a stării generale",
  shortTitle: "Evaluarea stării generale",
  sections: [
    {
      title: "Datele declarantului",
      fields: [
        { kind: "text", id: "declarant_nume", label: "Subsemnatul(a)", required: true },
        { kind: "text", id: "declarant_domiciliu", label: "Domiciliat(ă) în" },
        { kind: "text", id: "ocupatie", label: "Ocupația / locul de muncă al pacientului" },
        { kind: "text", id: "ci_seria", label: "Legitimat(ă) cu B.I./C.I. seria", short: true },
        { kind: "text", id: "ci_nr", label: "Nr.", short: true },
        {
          kind: "choice",
          id: "calitate",
          label: "În calitate de",
          required: true,
          note: "În cazul reprezentantului legal / aparținătorului se completează numele și prenumele în clar, precum și calitatea față de pacient.",
          options: [
            { id: "pacient", label: "Pacient(ă)" },
            {
              id: "reprezentant",
              label: "Reprezentant legal al pacientului",
              followUp: [
                { kind: "text", id: "varsta_pacient", label: "Vârsta pacientului (ani)", short: true },
              ],
            },
            {
              id: "apartinator",
              label: "Aparținător al pacientului",
              followUp: [
                {
                  kind: "text",
                  id: "relatie",
                  label: "Relația cu pacientul (soț/soție, frate/soră etc.)",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      title: "Starea de sănătate",
      fields: [
        {
          kind: "yesno",
          id: "gravida",
          label: "Sunteți / este posibil să fiți gravidă?",
          note: NOTE_FERTILE,
          optional: true,
          alert: true,
          followUp: [
            {
              kind: "text",
              id: "gravida_saptamani",
              label: "Ce vârstă are sarcina (în săptămâni)?",
              short: true,
            },
          ],
        },
        {
          kind: "yesno",
          id: "ciclu",
          label: "Sunteți în perioada ciclului menstrual?",
          note: NOTE_FERTILE,
          optional: true,
        },
        {
          kind: "yesno",
          id: "alergii",
          label: "Suferiți de alergii sau intoleranțe medicamentoase sau nemedicamentoase?",
          alert: true,
          followUp: [
            { kind: "text", id: "alergii_detalii", label: "Precizați la ce anume", multiline: true },
          ],
        },
        {
          kind: "yesno",
          id: "tratament",
          label: "Urmați un anumit tratament (medicamentos, homeopatic, fitoterapic etc.)?",
          alert: true,
          followUp: [
            {
              kind: "text",
              id: "tratament_detalii",
              label: "Precizați medicamentul / produsul și doza administrată",
              multiline: true,
            },
          ],
        },
        {
          kind: "yesno",
          id: "antibiotice",
          label: "Ați urmat tratament cu antibiotice în ultimele două săptămâni?",
          followUp: [
            { kind: "text", id: "antibiotice_detalii", label: "Precizați medicamentul și doza" },
          ],
        },
        {
          kind: "yesno",
          id: "anticoagulante",
          label: "Urmați tratament cu anticoagulante?",
          alert: true,
          followUp: [
            { kind: "text", id: "anticoagulante_medicament", label: "Medicamentul și doza administrată" },
            { kind: "text", id: "anticoagulante_inr", label: "Valoarea INR", short: true },
          ],
        },
        {
          kind: "yesno",
          id: "bifosfonati",
          label:
            "Urmați tratament cu: Fosamax, Fosavance, Actonel, Bonviva, Zometa, Aclasta (bifosfonați)?",
          alert: true,
          followUp: [
            { kind: "text", id: "bifosfonati_medicament", label: "Medicamentul și doza administrată" },
            {
              kind: "choice",
              id: "bifosfonati_cale",
              label: "Calea de administrare",
              options: opts(["intravenoasa", "intravenoasă"], ["orala", "orală"]),
            },
            {
              kind: "text",
              id: "bifosfonati_durata",
              label: "De cât timp urmați acest tratament (luni/ani)?",
              short: true,
            },
            { kind: "text", id: "bifosfonati_crosslaps", label: "Valoarea β-CrossLaps", short: true },
          ],
        },
        {
          kind: "yesno",
          id: "boli",
          label: "Suferiți sau ați suferit de vreo boală acută sau cronică?",
          itemize: true,
          followUp: diseaseGroups,
        },
      ],
    },
    {
      title: "Antecedente",
      fields: [
        {
          kind: "yesno",
          id: "interventii",
          label: "Ați mai fost supus(ă) unor intervenții chirurgicale?",
          followUp: [
            { kind: "text", id: "interventii_detalii", label: "Ce intervenție(i)?", multiline: true },
            {
              kind: "checks",
              id: "interventii_anestezie",
              label: "Tipul de anestezie",
              options: opts(
                ["loco_regionala", "loco-regională"],
                ["sedare", "sedare"],
                ["generala", "generală"]
              ),
              other: "altul",
            },
            {
              kind: "yesno",
              id: "interventii_incidente",
              label: "În timpul sau după intervenția chirurgicală au apărut incidente?",
              optional: true,
              alert: true,
              followUp: [
                { kind: "text", id: "interventii_incidente_detalii", label: "Precizați ce anume", multiline: true },
              ],
            },
          ],
        },
        {
          kind: "yesno",
          id: "transfuzii",
          label: "Ați primit transfuzii de sânge / derivate?",
        },
        {
          kind: "yesno",
          id: "tratamente_stoma",
          label: "Vi s-au mai efectuat tratamente stomatologice?",
          followUp: [
            {
              kind: "checks",
              id: "tratamente_stoma_anestezie",
              label: "Mi s-au realizat tratamente stomatologice",
              options: opts(
                ["fara", "fără anestezie"],
                ["locala", "cu anestezie locală"],
                ["locala_inhalatorie", "cu anestezie locală și sedare inhalatorie"],
                ["locala_iv", "cu anestezie locală și sedare intravenoasă"],
                ["generala", "cu anestezie generală"]
              ),
            },
          ],
        },
        {
          kind: "yesno",
          id: "complicatii_anestezie",
          label:
            "La tratamentele stomatologice anterioare au apărut accidente / incidente sau complicații la utilizarea anestezicelor?",
          alert: true,
          followUp: [
            {
              kind: "checks",
              id: "complicatii_anestezie_tip",
              label: "Au apărut",
              options: opts(["lesin", "leșin"], ["greata", "greață"], ["alergii", "alergii"]),
              other: "altele",
            },
          ],
        },
      ],
    },
    {
      title: "Sunteți / ați fost consumator de:",
      fields: [
        {
          kind: "yesno",
          id: "tutun",
          label: "Tutun",
          followUp: [
            {
              kind: "text",
              id: "tutun_detalii",
              label: "Ce cantitate și cât timp ați fumat / fumați?",
            },
          ],
        },
        {
          kind: "yesno",
          id: "alcool",
          label: "Alcool",
          followUp: [
            {
              kind: "text",
              id: "alcool_detalii",
              label: "Ce cantitate și cât timp ați consumat / consumați alcool?",
            },
          ],
        },
        {
          kind: "yesno",
          id: "droguri",
          label: "Droguri",
          alert: true,
          followUp: [
            { kind: "text", id: "droguri_detalii", label: "Ce drog / droguri utilizați?" },
          ],
        },
      ],
    },
    {
      fields: [
        {
          kind: "checks",
          id: "sursa",
          label: "Din ce surse ați auzit de serviciile noastre stomatologice?",
          options: opts(
            ["recomandare", "recomandare prieteni, familie"],
            ["medici", "alți medici"],
            ["facebook", "pagina de Facebook"],
            ["internet", "pagina de internet"],
            ["alte", "alte surse"]
          ),
        },
      ],
    },
  ],
  declaration: [
    "Toate informațiile sunt adevărate. Dacă apar modificări ale stării mele de sănătate voi anunța medicul dentist curant.",
  ],
  signatureLabel: "Semnătura declarantului",
  prefill: ({ patientName, address, occupation, latest }) => {
    const previous = latest["stare-generala"];
    // Actul de identitate nu e în fișă; se ia din chestionarul anterior.
    const idCard = previous?.calitate === "pacient" ? previous : undefined;
    return {
      declarant_nume: patientName,
      calitate: "pacient",
      ...(address ? { declarant_domiciliu: address } : {}),
      ...(occupation ? { ocupatie: occupation } : {}),
      ...(typeof idCard?.ci_seria === "string" ? { ci_seria: idCard.ci_seria } : {}),
      ...(typeof idCard?.ci_nr === "string" ? { ci_nr: idCard.ci_nr } : {}),
    };
  },
  toPatient: (a) => ({
    ...(typeof a.ocupatie === "string" ? { occupation: a.ocupatie } : {}),
    // Domiciliul e al pacientului doar când declară chiar pacientul.
    ...(a.calitate === "pacient" && typeof a.declarant_domiciliu === "string"
      ? { address: a.declarant_domiciliu }
      : {}),
  }),
};
