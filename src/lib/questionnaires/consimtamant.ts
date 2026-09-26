import type { QuestionnaireTemplate } from "./types";

/**
 * „Formular de informare și consimțământ al pacientului informat privind
 * tratamentul stomatologic" — transcris din
 * sample-files/Consimtamant_informat_tratament_stomatologic.pdf.
 *
 * La orice schimbare de text se crește `version`, iar versiunea veche se
 * păstrează dacă există consimțăminte semnate pe ea.
 */
export const consimtamant: QuestionnaireTemplate = {
  code: "consimtamant",
  version: 1,
  title: "Formular de informare și consimțământ al pacientului informat privind tratamentul stomatologic",
  shortTitle: "Consimțământ informat",
  sections: [
    {
      fields: [
        { kind: "text", id: "nume_pacient", label: "Nume și prenume pacient", required: true },
        { kind: "text", id: "cnp", label: "CNP", short: true },
        {
          kind: "text",
          id: "echipa_medicala",
          label: "Sunt de acord ca echipa medicală",
          note: "…să efectueze examinarea, diagnosticele, recomandările și actele medicale necesare în cazul meu.",
          required: true,
        },
      ],
      textAfter: [
        "Etapele necesare pentru tratarea afecțiunii(lor) mele stomatologice mi-au fost explicate și includ: obturații, lucrări protetice fixe, radiografii, extracții, tratamente endodontice, tratament parodontal, proteze mobilizabile, tratament ortodontic, altele.",
        "Am fost informat cu privire la diagnosticul afecțiunilor mele dentare, la alternativele de tratament ale acestor afecțiuni (dacă ele există), precum și la consecințele neintervenției terapeutice. Am înțeles că există riscuri inerente și potențiale pentru orice plan de tratament sau intervenție terapeutică. Deși nu apar în mod obișnuit, aceste riscuri se pot manifesta, după cum urmează:",
      ],
    },
    {
      title: "Radiografii",
      text: [
        "Pentru precizarea diagnosticului și stabilirea planului de tratament pot fi necesare serii repetate de radiografii sau alte metode de investigare imagistică (tomografie computerizată, teleradiografie de profil, repetarea examenului radiologic în diferite incidențe). Refuzul de a face aceste radiografii sau investigații imagistice poate avea consecințe negative asupra rezultatului final, mergând până la eșecul tratamentului. În timpul tratamentului pot apărea informații diagnostice neprevăzute, care să extindă amploarea și/sau tipul intervențiilor. Sunt de acord ca echipa medicală menționată anterior să realizeze și intervențiile neprevăzute în momentul inițierii tratamentului.",
      ],
    },
    {
      title: "Schimbări în planul de tratament",
      text: [
        "Am înțeles că în timpul procedurilor terapeutice planificate pot apărea informații diagnostice neprevăzute, care să extindă amploarea și/sau timpul intervenției(ilor). Autorizez prin aceasta persoana(ele) prevăzută(e) la paragraful 1 să realizeze și intervențiile neprevăzute în momentul inițierii tratamentului.",
      ],
    },
    {
      title: "Medicamentație",
      text: [
        "Anestezicele, antibioticele sau alte medicamente și substanțe pot cauza diverse reacții alergice care se pot manifesta prin, fără a se limita la: eritem (roșeață), tumefacții (umflături), dureri, până la șoc anafilactic.",
      ],
      fields: [
        {
          kind: "text",
          id: "alergii_substante",
          label: "Am informat medicul asupra faptului că sunt alergic(ă) la următoarele substanțe",
          summaryLabel: "Alergii",
          multiline: true,
          alert: true,
        },
      ],
      textAfter: ["Consimt la administrarea anestezicelor necesare."],
    },
    {
      title: "Anestezia",
      text: [
        "După anestezie poate apărea, fără a se limita la: reducerea sau pierderea sensibilității dinților vecini, a buzelor, limbii și a țesuturilor înconjurătoare (parestezie/anestezie) pe o perioadă nedeterminată de timp, apariția temporară a unui hematom local, zonă ușor dureroasă la locul de injecție, tumefacție (umflătură) temporară a obrazului sau a țesuturilor înconjurătoare.",
      ],
    },
    {
      title: "Obturații (plombe)",
      text: [
        "Realizarea sau înlocuirea obturațiilor pot produce – fără a se limita la: hipersensibilitate temporară a dintelui, inflamație a pulpei dentare cu necesitatea ulterioară a tratamentului endodontic (de canal), apariția unor fisuri/fracturi ale smalțului dentar, longevitate mai redusă a restaurărilor în raport cu cele precedente. În timp, obturațiile estetice își pot modifica culoarea din cauza alimentelor colorate, a fumatului etc.",
      ],
    },
    {
      title: "Tratamentul endodontic (de canal)",
      text: [
        "Tratamentul de canal nu garantează salvarea dintelui și există situații în care, în ciuda tuturor eforturilor depuse pentru salvarea dintelui, acesta trebuie extras. Alternativele tratamentului de canal sunt reprezentate de extracția dintelui sau nonintervenție. Este obligatorie finalizarea tratamentului endodontic. În timpul sau după efectuarea tratamentului de canal pot apărea următoarele, fără a se limita la: durere, tumefacție (umflătură), infecție, reinfecție, iritarea sau lezarea mucoasei bucale înconjurătoare, afectare parodontală (pierderea suportului osos și mobilizarea dintelui ca urmare a infecției), ruperea unor instrumente (cum ar fi acele de canal) în interiorul rădăcinii dintelui, perforația coroanei sau a rădăcinii dintelui. Rata de succes a tratamentului endodontic este de 85-95% și uneori tratamentul endodontic trebuie repetat sau/și pot fi necesare mici intervenții chirurgicale asupra dintelui respectiv, sau poate fi necesară reluarea tratamentului. Tratamentul de canal poate necesita uneori mai multe ședințe pentru a fi finalizat. De asemenea, tratamentul de canal poate determina colorarea dintelui și o susceptibilitate mai mare la fractură a dintelui; de aceea este obligatoriu ca după finalizarea tratamentului endodontic dintele să primească o restaurare definitivă: obturație sau coroană.",
      ],
    },
    {
      title: "Tratamentul de albire",
      text: [
        "După tratamentul de albire este posibil ca dinții să prezinte hipersensibilitate persistentă. În timpul și după tratamentul de albire este posibilă apariția sensibilității/leziunilor la nivelul gingiei. Intensitatea și durata efectului de albire sunt variabile.",
      ],
    },
    {
      title: "Extracția dentară",
      text: [
        "După extracția dentară poate apărea, prin afectarea nervilor din vecinătate, fără a se limita la: reducerea/pierderea sensibilității dinților vecini, a buzelor, limbii și a țesuturilor înconjurătoare (parestezie/anestezie) pe o perioadă nedeterminată de timp.",
        "Riscurile pe care le presupune extracția dentară pot fi, fără a se limita la: durere, tumefacție (umflătură), învinețire, alveolită (infecție), vindecare întârziată, afectarea dinților și a restaurărilor din vecinătate sau de pe arcada antagonistă, deschiderea sinusurilor maxilare, a foselor nazale, fractura rădăcinilor și împingerea lor în sinusul maxilar, în fosele nazale sau în spațiile înconjurătoare, în canalul mandibular sau în gaura mentală, aspirarea și/sau înghițirea de corpi străini, spasme musculare locale, fractura maxilarului sau a mandibulei, afectarea nervilor din vecinătate cu reducerea/pierderea sensibilității dinților vecini, a buzelor, limbii și a țesuturilor înconjurătoare (parestezie/anestezie) pe o perioadă nedeterminată de timp, lezarea unor vase de sânge de vecinătate: arteră alveolară, maxilară, palatină sau ramuri mucozale sau intraosoase ale acestora. Am înțeles că în cazul accidentelor din timpul anesteziei, a complicațiilor intraoperatorii, accidentelor și incidentelor postextracționale poate apărea necesitatea unui tratament de specialitate la un medic chirurg maxilo-facial, tratament de specialitate al cărui cost intră în responsabilitatea mea.",
      ],
    },
    {
      title: "Boala parodontală",
      text: [
        "Problemele parodontale manifestate prin afectarea gingiei și a osului adiacent pot duce la pierderea mai rapidă a dinților, lucrărilor protetice și implanturilor. Planul de tratament mi-a fost explicat și cuprinde: un program de întreținere/dispensarizare, intervenții de scaling, chiuretaj gingival și planare radiculară și în unele cazuri intervenții parodontale, inclusiv chirurgicale, asupra dinților, gingiei și osului, adiție osoasă și/sau extracții. Absența intervenției poate agrava starea de sănătate parodontală.",
      ],
    },
    {
      title: "Scaling, chiuretaj gingival, planare radiculară",
      text: [
        "După intervențiile de scaling, chiuretaj gingival și planare radiculară, dinții vor avea o mobilitate inițial crescută iar gingiile se vor retrage. Rădăcinile dentare astfel expuse vor fi mai sensibile. De obicei, hipermobilitatea și hipersensibilitatea se remit spontan în circa șase luni, însă pot necesita tratament suplimentar. Rădăcinile expuse au o structură mai poroasă decât smalțul dinților și sunt astfel mai susceptibile la retenția alimentelor și colorație decât restul suprafețelor dentare. Retracția gingivală din zona frontală maxilară poate duce la modificări de fonație care pot necesita intervenție terapeutică suplimentară.",
        "După intervențiile de scaling, chiuretaj gingival și planare radiculară este necesară o reevaluare diagnostică, în urma căreia pot fi recomandate și alte intervenții parodontale.",
      ],
    },
    {
      title: "Intervenții chirurgicale parodontale",
      text: [
        "Intervențiile parodontale sunt indicate în cazul persistenței pungilor parodontale/infecției. Aceste intervenții au ca scop reducerea/eliminarea pungilor parodontale patologice și curățarea riguroasă a suprafețelor radiculare. Însă, există situații în care după tratament parodontal, din cauza unor factori cum ar fi faza avansată a bolii parodontale, absența unui program susținut de întreținere/dispensarizare, factori nutriționali, endocrini, afecțiuni generale etc., problemele parodontale pot persista sau chiar se pot agrava, mergând până la pierderea dinților.",
      ],
    },
    {
      title: "Lucrări protetice",
      text: [
        { heading: "Lucrări protetice fixe" },
        "Pentru aplicarea lucrărilor protetice fixe este necesară prepararea (șlefuirea) dinților sau este necesară inserția implanturilor dentare (atunci când agregarea se face pe implanturi). Este foarte important să se respecte programările pentru probe în diverse etape de lucru și pentru cimentarea finală, deoarece întârzierile pot duce la afectarea integrității dinților șlefuiți, a bonturilor implantare și/sau a implantelor, și la alte modificări ce pot necesita refacerea lucrărilor protetice și/sau a implantelor, cu costuri adiționale care cad în responsabilitatea pacientului.",
        "După cimentarea fațetelor/coroanelor/punților poate apărea sensibilitate la nivelul dinților pe care acestea sunt aplicate, sau la nivelul porțiunii gingivale din zona corpului de punte.",
        "Ceramica dentară (porțelanul) este casantă; acrilatul dentar sau compozitul dentar se pot desprinde (fațete sau suprafețe întregi). Fațetele/coroanele din ceramică, zirconiu sau compozit, fără suport metalic, sunt restaurări fragile, care se pot fisura sau fractura relativ ușor, chiar în cazurile în care sunt corect concepute și realizate.",
        { heading: "Proteze mobilizabile" },
        "Purtarea unei proteze mobilizabile poate fi dificilă. Pot apărea zone dureroase persistente, modificări de fonație (vorbire) și dificultăți în masticație. Eficiența unei proteze totale este de aproximativ 30% față de eficiența unei arcade dentare integre. Protezarea imediată (plasarea protezei imediat după extracțiile dinților) poate fi dureroasă. Protezarea imediată necesită ajustări, căptușiri și rebazări. De asemenea, sunt necesare căptușiri sau rebazări ale protezelor la anumite intervale de timp. Este responsabilitatea pacientului de a respecta programarea pentru ședința de aplicare a protezei/protezelor mobilizabile pe câmpul protetic, deoarece întârzierile pot necesita refacerea protezei/protezelor și/sau a implantelor de sprijin (atunci când agregarea se face pe implanturi) cu costuri adiționale care intră în responsabilitatea pacientului.",
        "După cimentarea lucrărilor fixe și după aplicarea în cavitatea bucală a protezelor mobilizabile se recomandă: NU se va mușca din fructe (mere etc.); orice necesită „mușcătură” trebuie tăiat în bucăți mai mici; NU se vor zdrobi miezi de nucă, alune, boabe de cafea, oase din mâncare, sâmburi sau orice alte alimente dure sau lemnoase, protezele putându-se mișca din cauza forțelor masticatorii mari; NU se va încerca perforarea / desfacerea / tăierea / ruperea / tracționarea cu lucrările, sau cu orice alt dinte cu care lucrările intră în contact, a capacelor de sticle, ambalajelor alimentare sau nealimentare, foliilor de orice tip sau a altor materiale de uzanță zilnică; NU vor fi ținute cu lucrările obiecte dure; NU se practică sporturi agresive.",
        "Orice modificare a integrității lucrărilor protetice fixe sau mobilizabile trebuie anunțată în cel mai scurt timp echipei medicale, pentru a putea minimiza efectele asupra dinților pe care se ancorează, dar și asupra celorlalți dinți și lucrări și asupra țesuturilor moi înconjurătoare, sau asupra implantelor existente la nivelul cavității orale.",
        "Nicio formă de protezare fixă sau mobilizabilă nu este definitivă, orice piesă protetică necesitând la un moment dat ajustare sau refacere (în aceeași formă sau în formă nouă) în funcție de evoluția oaselor maxilare, a edentațiilor, a mucoasei și a gingiei acoperitoare, a uzurii normale a dinților protezelor, a modificărilor suferite de implantele inserate, sau a modificării lucrărilor protetice fixe sau mobilizabile existente.",
      ],
    },
    {
      title: "Bruxismul, alte parafuncții ocluzale",
      text: [
        "Obiceiurile nefuncționale care determină suprasolicitarea arcadelor dentare, cum ar fi: bruxismul (scrâșnitul dinților), încleștarea maxilarelor, onicofagia (roaderea unghiilor) etc., pot determina pierderea prematură a restaurărilor dentare, a protezelor mobilizabile, a implantelor, uzură patologică/fisuri/fracturi ale dinților naturali, uzură accentuată/fisuri/fracturi ale dinților sau ale bazelor protezelor fixe sau mobilizabile, modificarea structurilor de suport – rezorbții osoase sau boselarea proceselor alveolare, anchiloza rădăcinilor sau a implantelor, parodontite/periimplantite, hipercalcificări ale canalelor radiculare și mobilizarea dinților sau a implantelor existente.",
      ],
    },
    {
      title: "Întreținerea și dispensarizarea",
      text: [
        "Pentru a asigura funcționalitatea și longevitatea restaurărilor stomatologice, a dinților și a țesuturilor de suport ale acestora este necesar ca pacientul să se prezinte de cel puțin două ori pe an pentru control, igienizare profesională, precum și pentru remedierea precoce a eventualelor probleme apărute. Nerespectarea acestor reguli poate determina eșecul prematur al tratamentelor, cu apariția unor complicații locale sau la distanță.",
      ],
    },
  ],
  declaration: [
    "Sunt pe deplin de acord cu recomandările medicului / echipei medicale în îngrijirea căruia / căreia mă aflu, înțelegând că nerespectarea acestor recomandări poate duce la un rezultat final mai puțin decât optim sau chiar la eșecul tratamentului.",
    "Declar că mi-au fost furnizate informații legate de serviciile medicale disponibile, despre starea mea de sănătate, diagnostic, prognostic, natura și scopul tratamentului propus, intervențiile și strategia terapeutică propuse, riscurile și consecințele tratamentului, alternativele viabile de tratament, riscurile potențiale, riscurile neefectuării tratamentului, riscurile nerespectării recomandărilor medicale și costul estimativ al tratamentului.",
    "Sunt de acord cu recoltarea, păstrarea și folosirea produselor biologice.",
    "Am fost înștiințat de dreptul la o a doua opinie medicală.",
    "Am avut oportunitatea să pun întrebările pe care le-am dorit privind planul de tratament și tuturor întrebărilor li s-a răspuns satisfăcător.",
    "Certific că știu să scriu și să citesc în limba română și că am înțeles în totalitate acest text.",
    "Declar că am înțeles toate informațiile furnizate mai sus de către echipa medicală enumerată anterior, că am prezentat echipei medicale doar informații adevărate și îmi exprim consimțământul informat pentru efectuarea actelor medicale.",
  ],
  signatureLabel: "Pacient",
  doctorSignature: true,
  toPatient: (a) => (typeof a.cnp === "string" ? { cnp: a.cnp } : {}),
  prefill: ({ patientName, cnp, latest }) => {
    const health = latest["stare-generala"];
    // Alergiile declarate în chestionarul de stare generală, ca să nu fie scrise de două ori.
    const allergies =
      health?.alergii === "da" && typeof health.alergii_detalii === "string"
        ? health.alergii_detalii
        : undefined;
    return {
      nume_pacient: patientName,
      echipa_medicala: "Dr. Oana Vlad",
      ...(cnp ? { cnp } : {}),
      ...(allergies ? { alergii_substante: allergies } : {}),
    };
  },
};
