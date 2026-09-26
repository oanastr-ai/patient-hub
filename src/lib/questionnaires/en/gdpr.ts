import type { Translation } from "../translate";

/**
 * Traducerea în engleză a chestionarului „Acord GDPR".
 * Cheile sunt textele românești exacte din șablon; un text românesc schimbat
 * fără traducere apare netradus (verificat de `untranslated`).
 */
export const gdprEn: Translation = {
  strings: {
    "Notă de informare și acord privind prelucrarea datelor cu caracter personal":
      "Information notice and consent regarding the processing of personal data",
    "Acord GDPR":
      "GDPR consent",
    "În conformitate cu Regulamentul (UE) 2016/679 (GDPR) și Legea nr. 190/2018.":
      "In accordance with Regulation (EU) 2016/679 (GDPR) and Romanian Law no. 190/2018.",
    "Nume și prenume pacient":
      "Patient's full name",
    "CNP":
      "Personal numeric code (CNP)",
    "Adresa":
      "Address",
    "Telefon":
      "Phone",
    "E-mail":
      "E-mail",
    "Reprezentant legal (pentru minori / persoane fără discernământ)?":
      "Legal representative (for minors / persons lacking capacity)?",
    "Numele și prenumele reprezentantului":
      "Representative's full name",
    "Calitatea (părinte, tutore etc.)":
      "Capacity (parent, guardian etc.)",
    "CNP reprezentant":
      "Representative's CNP / ID number",
    "1. Operatorul de date":
      "1. Data controller",
    "Datele dumneavoastră sunt prelucrate de dr. Oana Maria Vlad, medic stomatolog, în calitate de operator de date cu caracter personal.":
      "Your data is processed by Dr. Oana Maria Vlad, dentist, as the controller of personal data.",
    "E-mail de contact: office@dr-oanavlad.com":
      "Contact e-mail: office@dr-oanavlad.com",
    "2. Ce date prelucrăm":
      "2. What data we process",
    "Date de identificare și contact: nume, prenume, CNP, data nașterii, adresă, telefon, e-mail;":
      "Identification and contact data: first name, last name, CNP, date of birth, address, phone, e-mail;",
    "Date privind sănătatea: anamneza (chestionarul de stare generală), afecțiuni, alergii, medicație, diagnostic, plan și tratamente efectuate, radiografii, CBCT, fotografii intra- și extraorale, amprente și scanări digitale;":
      "Health data: medical history (general health questionnaire), conditions, allergies, medication, diagnosis, treatment plan and treatments performed, X-rays, CBCT, intra- and extra-oral photographs, impressions and digital scans;",
    "Date financiare: servicii efectuate, plăți, facturi / chitanțe.":
      "Financial data: services provided, payments, invoices / receipts.",
    "3. Scopurile și temeiul legal al prelucrării":
      "3. Purposes and legal basis of processing",
    "Acordarea asistenței medicale stomatologice (examinare, diagnostic, tratament, completarea fișei pacientului) – art. 6 alin. (1) lit. b) și c) și art. 9 alin. (2) lit. h) GDPR, Legea nr. 46/2003 privind drepturile pacientului și Legea nr. 95/2006 privind reforma în domeniul sănătății. Pentru acest scop nu este necesar consimțământul dumneavoastră; fără aceste date însă tratamentul nu poate fi realizat în siguranță.":
      "Providing dental care (examination, diagnosis, treatment, keeping the patient record) – art. 6(1)(b) and (c) and art. 9(2)(h) GDPR, Law no. 46/2003 on patients' rights and Law no. 95/2006 on healthcare reform. Your consent is not required for this purpose; however, without this data, treatment cannot be provided safely.",
    "Programări, anunțarea modificărilor de programare și reamintiri pentru controalele periodice (telefon, SMS, WhatsApp, e-mail) – art. 6 alin. (1) lit. b) și f) GDPR.":
      "Appointments, notice of appointment changes and reminders for regular check-ups (phone, SMS, WhatsApp, e-mail) – art. 6(1)(b) and (f) GDPR.",
    "Îndeplinirea obligațiilor legale fiscale, contabile și de raportare către autorități – art. 6 alin. (1) lit. c) GDPR.":
      "Complying with legal tax, accounting and reporting obligations to the authorities – art. 6(1)(c) GDPR.",
    "Constatarea, exercitarea sau apărarea unor drepturi în instanță – art. 9 alin. (2) lit. f) GDPR.":
      "Establishing, exercising or defending legal claims – art. 9(2)(f) GDPR.",
    "Scopuri opționale, numai cu acordul dumneavoastră (secțiunea 9) – art. 6 alin. (1) lit. a) și art. 9 alin. (2) lit. a) GDPR.":
      "Optional purposes, only with your consent (section 9) – art. 6(1)(a) and art. 9(2)(a) GDPR.",
    "4. Cui pot fi comunicate datele":
      "4. Who the data may be shared with",
    "Numai în măsura necesară: laboratoare de tehnică dentară, centre de radiologie și imagistică, alți medici la care sunteți îndrumat(ă), furnizori de software medical, programări și servicii IT, contabil, asigurători / Casa de Asigurări de Sănătate (dacă este cazul), precum și autorități publice, la cererea lor legală. Toți aceștia au obligația de a păstra confidențialitatea datelor. Datele nu sunt transferate în afara Spațiului Economic European decât cu garanțiile prevăzute de capitolul V din GDPR.":
      "Only as far as necessary: dental laboratories, radiology and imaging centres, other doctors you are referred to, providers of medical software, appointment and IT services, the accountant, insurers / the National Health Insurance House (where applicable), and public authorities upon lawful request. All of them are obliged to keep the data confidential. Data is not transferred outside the European Economic Area except with the safeguards provided in Chapter V of the GDPR.",
    "5. Cât timp păstrăm datele":
      "5. How long we keep the data",
    "Documentele medicale (fișa pacientului, radiografii, consimțăminte) se păstrează pe durata prevăzută de legislația privind documentele medicale; documentele financiar-contabile, pe durata prevăzută de legislația contabilă și fiscală. Datele prelucrate pe baza consimțământului se păstrează până la retragerea acestuia. La expirarea termenelor, datele sunt șterse sau anonimizate.":
      "Medical records (patient record, X-rays, consent forms) are kept for the period required by the legislation on medical records; financial and accounting documents for the period required by accounting and tax legislation. Data processed on the basis of consent is kept until consent is withdrawn. When these periods expire, the data is deleted or anonymised.",
    "6. Confidențialitate și securitate":
      "6. Confidentiality and security",
    "Datele sunt protejate de secretul profesional medical și de măsuri tehnice și organizatorice adecvate (acces restricționat, parole, copii de siguranță, arhivare securizată). CNP-ul este prelucrat în condițiile art. 4 din Legea nr. 190/2018.":
      "The data is protected by medical professional secrecy and by appropriate technical and organisational measures (restricted access, passwords, backups, secure archiving). The CNP is processed under the conditions of art. 4 of Law no. 190/2018.",
    "7. Drepturile dumneavoastră":
      "7. Your rights",
    "Aveți dreptul de acces la date, de rectificare, de ștergere (în limitele obligațiilor legale de păstrare a documentelor medicale), de restricționare a prelucrării, la portabilitatea datelor, de opoziție și dreptul de a vă retrage oricând consimțământul, fără a afecta legalitatea prelucrării efectuate anterior. Puteți obține gratuit o copie a fișei medicale și a radiografiilor. Cererile se depun în scris, la adresa de e-mail de la punctul 1 sau la cabinet, și primesc răspuns în cel mult o lună. Puteți depune plângere la ANSPDCP (www.dataprotection.ro).":
      "You have the right of access to your data, to rectification, to erasure (within the limits of the legal obligations to keep medical records), to restriction of processing, to data portability, to object, and the right to withdraw your consent at any time, without affecting the lawfulness of processing carried out before. You can obtain a copy of your medical record and X-rays free of charge. Requests should be made in writing, to the e-mail address in section 1 or at the clinic, and will be answered within one month at most. You can lodge a complaint with ANSPDCP, the Romanian data protection authority (www.dataprotection.ro).",
    "8. Declarație":
      "8. Declaration",
    "Declar că am citit și am înțeles prezenta notă de informare, că datele furnizate sunt reale și că voi anunța orice modificare a acestora sau a stării mele de sănătate.":
      "I declare that I have read and understood this information notice, that the data I have provided is true, and that I will notify any change to it or to my state of health.",
    "9. Acorduri opționale":
      "9. Optional consents",
    "Refuzul nu afectează în niciun fel tratamentul. Acordul poate fi retras oricând, în scris.":
      "Refusing does not affect your treatment in any way. Consent can be withdrawn at any time, in writing.",
    "Folosirea radiografiilor și fotografiilor mele anonimizate (fără nume și fără ca fața să fie recunoscută) în scop didactic și științific (cursuri, congrese, publicații de specialitate).":
      "Use of my anonymised X-rays and photographs (without my name and without my face being recognisable) for teaching and scientific purposes (courses, conferences, specialist publications).",
    "Publicarea fotografiilor dentare fără elemente de identificare (zâmbet, dinți, înainte/după) pe site-ul și rețelele de socializare ale cabinetului.":
      "Publication of dental photographs without identifying features (smile, teeth, before/after) on the clinic's website and social media.",
    "Publicarea fotografiilor / videoclipurilor în care fața mea este vizibilă, pe site-ul și rețelele de socializare ale cabinetului.":
      "Publication of photographs / videos in which my face is visible, on the clinic's website and social media.",
    "Semnătura pacientului / reprezentantului legal":
      "Signature of the patient / legal representative",
  },
};
