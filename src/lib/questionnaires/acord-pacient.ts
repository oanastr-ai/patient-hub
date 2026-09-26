import type { Field, QuestionnaireTemplate } from "./types";

/**
 * „Acordul pacientului informat" — transcris din
 * sample-files/Acordul_pacientului_informat.pdf.
 *
 * Tabelele da/nu (punctele 4–7) le completează medicul; acordul sau refuzul
 * și semnătura sunt ale pacientului / reprezentantului legal.
 *
 * La orice schimbare de text se crește `version`, iar versiunea veche se
 * păstrează dacă există acorduri semnate pe ea.
 */

const INSIST = "Insistându-se asupra următoarelor";

function yesNo(id: string, label: string, detail?: boolean, note?: string): Field {
  return {
    kind: "yesno",
    id,
    label,
    note,
    followUp: detail ? [{ kind: "text", id: `${id}_detalii`, label: INSIST, multiline: true }] : [],
  };
}

export const acordPacient: QuestionnaireTemplate = {
  code: "acord-pacient",
  version: 1,
  title: "Acordul pacientului informat",
  shortTitle: "Acordul pacientului informat",
  summary: false,
  signedTime: true,
  sections: [
    {
      title: "1. Datele pacientului",
      fields: [
        { kind: "text", id: "pacient_nume", label: "Numele și prenumele", required: true },
        { kind: "text", id: "pacient_domiciliu", label: "Domiciliul / reședința" },
      ],
    },
    {
      title: "2. Reprezentantul legal al pacientului",
      fields: [
        {
          kind: "yesno",
          id: "reprezentant",
          label: "Pacientul are reprezentant legal?",
          note: "Se utilizează în cazul minorilor și majorilor fără discernământ (pentru art. 8 alin. (3)–(5) din normele metodologice).",
          followUp: [
            { kind: "text", id: "reprezentant_nume", label: "Numele și prenumele", required: true },
            { kind: "text", id: "reprezentant_domiciliu", label: "Domiciliul / reședința" },
            { kind: "text", id: "reprezentant_calitate", label: "Calitatea", required: true },
          ],
        },
      ],
    },
    {
      title: "3. Actul medical",
      fields: [
        {
          kind: "text",
          id: "act_medical",
          label: "Descriere",
          note: "Se completează de medic: intervenția pentru care se cere acordul (ex. extracție 38, tratament endodontic 26).",
          multiline: true,
        },
      ],
    },
    {
      title: "4. Au fost furnizate pacientului următoarele informații în legătură cu actul medical",
      fields: [
        yesNo("info_stare", "Date despre starea de sănătate"),
        yesNo("info_diagnostic", "Diagnostic"),
        yesNo("info_prognostic", "Prognostic"),
        yesNo("info_natura", "Natura și scopul actului medical propus"),
        yesNo("info_interventii", "Intervențiile și strategia terapeutică propuse"),
        yesNo("info_beneficii", "Beneficiile și consecințele actului medical", true),
        yesNo("info_riscuri", "Riscurile potențiale ale actului medical", true),
        yesNo("info_alternative", "Alternative viabile de tratament și riscurile acestora", true),
        yesNo("info_neefectuare", "Riscurile neefectuării tratamentului"),
        yesNo("info_nerespectare", "Riscurile nerespectării recomandărilor medicale"),
      ],
    },
    {
      title: "5. Consimțământ pentru recoltare",
      fields: [
        yesNo(
          "recoltare",
          "Pacientul este de acord cu recoltarea, păstrarea și folosirea produselor biologice."
        ),
      ],
    },
    {
      title: "6. Alte informații care au fost furnizate pacientului",
      fields: [
        yesNo("alte_servicii", "Informații despre serviciile medicale disponibile"),
        yesNo(
          "alte_personal",
          "Informații despre identitatea și statutul profesional al personalului care îl va trata",
          false,
          "Identificat în tabelul cu personalul medical care îngrijește pacientul."
        ),
        yesNo(
          "alte_reguli",
          "Informații despre regulile / practicile din unitatea medicală, pe care trebuie să le respecte"
        ),
        yesNo("alte_a_doua_opinie", "Pacientul a fost înștiințat că are dreptul la o a doua opinie medicală."),
      ],
    },
    {
      title: "7. Informarea în continuare",
      fields: [
        yesNo("informat_in_continuare", "Pacientul dorește să fie informat în continuare despre starea sa de sănătate."),
      ],
    },
    {
      title: "Tabel cu personalul medical care îngrijește pacientul",
      fields: [
        {
          kind: "text",
          id: "personal_medical",
          label: "Numele și prenumele — statutul profesional (câte unul pe rând)",
          multiline: true,
          required: true,
        },
      ],
    },
    {
      title: "Declarație",
      fields: [
        {
          kind: "text",
          id: "subsemnatul",
          label: "Subsemnatul (numele și prenumele pacientului / reprezentantului legal)",
          required: true,
        },
        {
          kind: "text",
          id: "informat_de",
          label:
            "Declar că am înțeles toate informațiile furnizate de către (numele și prenumele medicului / asistentului medical)",
          required: true,
        },
        {
          kind: "choice",
          id: "decizie",
          label: "…și enumerate mai sus, că am prezentat medicului / asistentului medical doar informații adevărate și:",
          required: true,
          options: [
            { id: "acord", label: "îmi exprim ACORDUL informat pentru efectuarea actului medical" },
            {
              id: "refuz",
              label:
                "mi s-au explicat consecințele refuzului actului medical și îmi exprim REFUZUL pentru efectuarea actului medical",
            },
          ],
        },
      ],
    },
  ],
  declaration: [],
  signatureLabel: "Semnătura pacientului / reprezentantului legal",
  toPatient: (a) =>
    typeof a.pacient_domiciliu === "string" ? { address: a.pacient_domiciliu } : {},
  prefill: ({ patientName, address }) => ({
    pacient_nume: patientName,
    subsemnatul: patientName,
    reprezentant: "nu",
    informat_de: "Dr. Oana Vlad",
    personal_medical: "Dr. Oana Vlad — medic stomatolog",
    ...(address ? { pacient_domiciliu: address } : {}),
  }),
};
